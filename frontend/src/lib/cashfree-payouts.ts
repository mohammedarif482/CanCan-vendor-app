import { supabaseAdmin } from '@/lib/supabase';

/**
 * Cashfree Payouts (v2 API) — money-out rail for vendor settlements.
 * Separate product/credentials from Cashfree Payment Gateway (lib/payment-gateway.ts).
 *
 * Docs: https://docs.cashfree.com/docs/payouts
 *
 * Required env vars:
 *   CASHFREE_PAYOUTS_CLIENT_ID
 *   CASHFREE_PAYOUTS_CLIENT_SECRET
 *   CASHFREE_PAYOUTS_ENV=TEST|PROD   (defaults to TEST)
 */

const BASE_URL =
  process.env.CASHFREE_PAYOUTS_ENV === 'PROD'
    ? 'https://payout-api.cashfree.com'
    : 'https://payout-gamma.cashfree.com';

let cachedToken: { token: string; expiresAt: number } | null = null;

function requireCreds() {
  const clientId = process.env.CASHFREE_PAYOUTS_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_PAYOUTS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Cashfree Payouts credentials missing (CASHFREE_PAYOUTS_CLIENT_ID / CASHFREE_PAYOUTS_CLIENT_SECRET)');
  }
  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const { clientId, clientSecret } = requireCreds();
  const res = await fetch(`${BASE_URL}/payout/v1/authorize`, {
    method: 'POST',
    headers: {
      'X-Client-Id': clientId,
      'X-Client-Secret': clientSecret,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  if (!res.ok || data.subCode !== '200' || !data.data?.token) {
    throw new Error(`Cashfree authorize failed: ${JSON.stringify(data)}`);
  }

  // Token is valid ~10 hours; refresh a little early.
  cachedToken = { token: data.data.token, expiresAt: Date.now() + 9 * 60 * 60 * 1000 };
  return cachedToken.token;
}

async function cfRequest(path: string, init: RequestInit) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

type VendorForPayout = {
  id: string;
  owner_name?: string | null;
  business_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  bank_account_holder_name?: string | null;
  payout_vpa?: string | null;
  cf_beneficiary_id?: string | null;
};

/**
 * Ensures a Cashfree beneficiary exists for this vendor; creates one if
 * needed and caches the beneficiary id on the vendor row. Throws if the
 * vendor has no bank account or UPI VPA on file — that's a real
 * precondition (we cannot pay out money with nowhere to send it).
 */
async function ensureBeneficiary(vendor: VendorForPayout): Promise<string> {
  if (vendor.cf_beneficiary_id) return vendor.cf_beneficiary_id;

  const hasBank = vendor.bank_account_number && vendor.bank_ifsc;
  const hasVpa = Boolean(vendor.payout_vpa);
  if (!hasBank && !hasVpa) {
    throw new Error(`Vendor ${vendor.id} has no bank account or UPI VPA on file — cannot create payout beneficiary`);
  }

  const beneId = `vendor_${vendor.id}`.slice(0, 50);
  const payload: Record<string, unknown> = {
    beneId,
    name: vendor.bank_account_holder_name || vendor.owner_name || vendor.business_name || 'Vendor',
    email: vendor.email || undefined,
    phone: vendor.phone || undefined,
    address1: vendor.address || undefined,
  };
  if (hasBank) {
    payload.bankAccount = vendor.bank_account_number;
    payload.ifsc = vendor.bank_ifsc;
  } else {
    payload.vpa = vendor.payout_vpa;
  }

  const { ok, data } = await cfRequest('/payout/v1/addBeneficiary', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  // subCode 540 = BENEFICIARY ALREADY EXISTS — treat as success and reuse beneId.
  if (!ok && data.subCode !== '540') {
    throw new Error(`Cashfree addBeneficiary failed: ${JSON.stringify(data)}`);
  }

  await supabaseAdmin.from('vendors').update({ cf_beneficiary_id: beneId }).eq('id', vendor.id);
  return beneId;
}

export async function executeCashfreePayout(params: {
  vendor: VendorForPayout;
  amount: number;
  transferId: string;
}): Promise<{ providerPayoutId: string; status: 'paid' | 'pending' | 'failed'; raw: unknown }> {
  const beneId = await ensureBeneficiary(params.vendor);

  const { ok, data } = await cfRequest('/payout/v1/requestTransfer', {
    method: 'POST',
    body: JSON.stringify({
      beneId,
      amount: params.amount.toFixed(2),
      transferId: params.transferId,
      transferMode: params.vendor.payout_vpa && !params.vendor.bank_account_number ? 'upi' : 'banktransfer',
    }),
  });

  if (!ok) {
    throw new Error(`Cashfree requestTransfer failed: ${JSON.stringify(data)}`);
  }

  // status: SUCCESS | PENDING | REJECTED (per Cashfree docs)
  const cfStatus = String(data.status || data.data?.transfer?.status || '').toUpperCase();
  const status = cfStatus === 'SUCCESS' ? 'paid' : cfStatus === 'REJECTED' ? 'failed' : 'pending';

  return { providerPayoutId: params.transferId, status, raw: data };
}

export async function getCashfreeTransferStatus(transferId: string) {
  const { data } = await cfRequest(`/payout/v1/getTransferStatus?transferId=${encodeURIComponent(transferId)}`, {
    method: 'GET',
  });
  return data;
}
