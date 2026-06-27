import { supabaseAdmin } from '@/lib/supabase';

/**
 * Push notifications to vendors' Flutter app via Firebase Cloud Messaging.
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY (the JSON content of a Firebase
 * service account key, generated in Firebase Console → Project Settings →
 * Service Accounts → Generate new private key). Until that env var is set,
 * sends are skipped (logged, not thrown) so order/payout flows are never
 * blocked by a missing push credential.
 */

let cachedApp: import('firebase-admin/app').App | null | undefined;

async function getMessaging() {
  if (cachedApp === undefined) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) {
      console.warn('[push] FIREBASE_SERVICE_ACCOUNT_KEY not set — push notifications disabled.');
      cachedApp = null;
    } else {
      const { initializeApp, getApps, cert } = await import('firebase-admin/app');
      const serviceAccount = JSON.parse(raw);
      cachedApp = getApps().length > 0 ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
    }
  }
  if (!cachedApp) return null;
  const { getMessaging: getMessagingImpl } = await import('firebase-admin/messaging');
  return getMessagingImpl(cachedApp);
}

async function getVendorTokens(vendorId: string): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from('device_tokens')
    .select('token')
    .eq('vendor_id', vendorId);
  return (data || []).map((row) => row.token as string);
}

export async function sendVendorPush(
  vendorId: string,
  title: string,
  body: string,
  data: Record<string, string> = {},
) {
  const messaging = await getMessaging();
  if (!messaging) return { sent: 0, skipped: true };

  const tokens = await getVendorTokens(vendorId);
  if (tokens.length === 0) return { sent: 0, skipped: false };

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data,
  });

  // Prune tokens that are no longer valid (uninstalled app, expired, etc).
  const staleTokens = response.responses
    .map((r, i) => (!r.success && isUnregisteredError(r.error?.code) ? tokens[i] : null))
    .filter((t): t is string => Boolean(t));

  if (staleTokens.length > 0) {
    await supabaseAdmin.from('device_tokens').delete().in('token', staleTokens);
  }

  return { sent: response.successCount, skipped: false };
}

function isUnregisteredError(code?: string) {
  return code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token';
}

export async function notifyVendorNewOrder(vendorId: string, orderRef: string, canCount: number) {
  try {
    await sendVendorPush(
      vendorId,
      'New order received',
      `Order ${orderRef} — ${canCount} can(s). Tap to view.`,
      { type: 'new_order', order_ref: orderRef },
    );
  } catch (e) {
    console.error('[push] notifyVendorNewOrder failed', e);
  }
}

export async function notifyVendorOrderAssigned(vendorId: string, orderRef: string) {
  try {
    await sendVendorPush(
      vendorId,
      'Order assigned to you',
      `Order ${orderRef} has been assigned to you for delivery.`,
      { type: 'order_assigned', order_ref: orderRef },
    );
  } catch (e) {
    console.error('[push] notifyVendorOrderAssigned failed', e);
  }
}
