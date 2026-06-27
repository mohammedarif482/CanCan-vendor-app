import { supabaseAdmin } from '@/lib/supabase';
import { appendVendorWalletEntry } from '@/lib/finance-ledger';

export const TERMINAL_REVERSAL_STATUSES = new Set(['cancelled', 'failed']);

/**
 * Reverses any completed payments for an order: flips each payment to
 * 'refunded' and debits the vendor wallet for what was credited, marking
 * the commission ledger row reversed. Used whenever an order is cancelled
 * or fails after payment was already collected (admin status changes,
 * vendor cancellation, auto carry-forward).
 *
 * Caller must ensure this only runs once per order transition into a
 * terminal state (see TERMINAL_REVERSAL_STATUSES usage at call sites) —
 * the per-payment claim below (conditional UPDATE) prevents double-debit
 * even if called concurrently, but calling it repeatedly for an order
 * that's already terminal is still wasted work, not a safety net to rely on.
 */
export async function reversePostedPaymentsForOrder(orderId: string) {
    const { data: payments } = await supabaseAdmin
        .from('payments')
        .select('id, vendor_id, vendor_payable, platform_commission, status')
        .eq('order_id', orderId)
        .eq('status', 'completed');

    for (const payment of payments || []) {
        const vendorId = (payment as any).vendor_id as string | null;
        const vendorPayable = Number((payment as any).vendor_payable || 0);

        const { data: claimed } = await supabaseAdmin
            .from('payments')
            .update({ status: 'refunded', refunded_at: new Date().toISOString() })
            .eq('id', (payment as any).id)
            .eq('status', 'completed')
            .select('id');

        if (!claimed || claimed.length === 0) continue;

        if (vendorId && vendorPayable) {
            await appendVendorWalletEntry({
                vendorId,
                orderId,
                paymentId: (payment as any).id,
                entryType: 'reversal',
                sourceType: 'refund',
                amount: vendorPayable,
                notes: 'Order cancelled/failed after payment — reversing vendor payable',
            });
        }
    }

    const { error: ledgerError } = await supabaseAdmin
        .from('commission_ledger')
        .update({ status: 'reversed' })
        .eq('order_id', orderId)
        .neq('status', 'reversed');
    if (ledgerError && !String(ledgerError.message || '').includes('does not exist')) {
        console.error('[reversePostedPaymentsForOrder] commission_ledger update failed', ledgerError);
    }
}

export async function releaseStockForOrder(orderId: string, vendorId: string | null) {
    if (!vendorId) return;
    const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

    for (const item of items || []) {
        const productId = (item as any).product_id as string | null;
        const quantity = Number((item as any).quantity || 0);
        if (!productId || !quantity) continue;

        const { error } = await supabaseAdmin.rpc('release_can_stock', {
            p_vendor_id: vendorId,
            p_product_id: productId,
            p_quantity: quantity,
        });
        if (error && !String(error.message || '').includes('does not exist')) {
            console.error('[releaseStockForOrder] release_can_stock failed', error);
        }
    }
}

/** Reverse payments + release stock for an order moving into a terminal state. Logs but never throws. */
export async function reverseOrderFinancialsAndStock(orderId: string, vendorId: string | null) {
    try {
        await reversePostedPaymentsForOrder(orderId);
    } catch (reversalError) {
        console.error('[reverseOrderFinancialsAndStock] payment reversal failed', reversalError);
    }
    try {
        await releaseStockForOrder(orderId, vendorId);
    } catch (stockError) {
        console.error('[reverseOrderFinancialsAndStock] stock release failed', stockError);
    }
}
