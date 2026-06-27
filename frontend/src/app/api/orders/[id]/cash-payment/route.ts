import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateVendorBySupabaseToken, unauthorized, forbidden } from '@/lib/auth';
import { createPaymentRecord, updateOrderFinancialState } from '@/lib/finance-ledger';

/**
 * Vendor-facing: record a cash payment the vendor collected in person
 * (collection_mode is always 'cash_vendor' here — the vendor already
 * physically holds the cash, so unlike admin-collected cash_platform
 * payments, this does NOT credit a vendor_wallet_ledger entry. Mirrors
 * the existing admin endpoint's cash_vendor branch at
 * frontend/src/app/api/orders/[id]/payment/route.ts:66, which already
 * skips the wallet credit for this collection_mode — same logic, just
 * reachable with a vendor's own Supabase session instead of an admin JWT.
 *
 * This replaces two previously-divergent paths that wrote straight to
 * `orders` columns from the Flutter app (update_status_modal.dart's "Cash
 * Paid" toggle, and payments_screen.dart's "Record Payment" dialog) without
 * ever inserting a `payments` row — breaking reconciliation/audit trail.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const vendor = await authenticateVendorBySupabaseToken(req);
    if (!vendor) return unauthorized();

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount || 0);

    if (amount <= 0) {
        return Response.json({ error: 'amount must be greater than 0' }, { status: 400 });
    }

    const { data: order, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('id, vendor_id, customer_id, total_amount, gross_amount, platform_commission_amount, vendor_net_amount, amount_paid')
        .eq('id', id)
        .maybeSingle();

    if (fetchError || !order) {
        return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    if ((order as any).vendor_id !== vendor.vendorId) {
        return forbidden('You do not own this order');
    }

    const grossAmount = Number((order as any).gross_amount || (order as any).total_amount || 0);
    const alreadyPaid = Number((order as any).amount_paid || 0);
    const newAmountPaid = Number((alreadyPaid + amount).toFixed(2));
    const remaining = Number(Math.max(grossAmount - newAmountPaid, 0).toFixed(2));

    if (newAmountPaid > grossAmount + 0.01) {
        return Response.json({ error: 'Payment amount exceeds remaining order balance' }, { status: 400 });
    }

    const commission = Number((order as any).platform_commission_amount || 0);
    const vendorNet = Number((order as any).vendor_net_amount || Math.max(grossAmount - commission, 0));

    await createPaymentRecord({
        orderId: (order as any).id,
        vendorId: (order as any).vendor_id,
        customerId: (order as any).customer_id,
        provider: 'cash',
        providerPaymentId: `cash_vendor_${(order as any).id}_${Date.now()}`,
        collectionMode: 'cash_vendor',
        amount,
        paymentMethod: 'cash',
        platformCommission: commission,
        vendorPayable: Number(((vendorNet / Math.max(grossAmount, 1)) * amount).toFixed(2)),
        status: 'completed',
        idempotencyKey: `cash_vendor:${(order as any).id}:${Date.now()}`,
        metadata: { collected_by_vendor: vendor.vendorId },
    });

    const updated = await updateOrderFinancialState((order as any).id, {
        payment_status: remaining <= 0 ? 'paid' : 'unpaid',
        payment_state: remaining <= 0 ? 'collected_cash_vendor' : 'partially_collected',
        payment_method: 'cash',
        amount_paid: newAmountPaid,
        remaining_amount: remaining,
        payment_marked_at: new Date().toISOString(),
    });

    return Response.json(updated);
}
