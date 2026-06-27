import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateVendorBySupabaseToken, unauthorized, forbidden } from '@/lib/auth';
import { reverseOrderFinancialsAndStock } from '@/lib/order-lifecycle';
import { notifyOrderCancelled } from '@/lib/whatsapp-notifications';

/**
 * Vendor-facing: cancel an order, reverse any collected payment + release
 * reserved stock, and notify the customer on WhatsApp. Only the owning
 * vendor can cancel their own order.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const vendor = await authenticateVendorBySupabaseToken(req);
    if (!vendor) return unauthorized();

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = typeof body?.reason === 'string' ? body.reason : null;

    const { data: order, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('id, vendor_id, status, order_number, customer:customers(phone)')
        .eq('id', id)
        .maybeSingle();

    if (fetchError || !order) {
        return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    if ((order as any).vendor_id !== vendor.vendorId) {
        return forbidden('You do not own this order');
    }

    const previousStatus = (order as any).status as string;
    if (previousStatus === 'delivered' || previousStatus === 'completed') {
        return Response.json({ error: 'Order already delivered — cannot cancel' }, { status: 400 });
    }
    if (previousStatus === 'cancelled') {
        return Response.json({ error: 'Order already cancelled' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'cancelled', cancellation_reason: reason })
        .eq('id', id)
        .select()
        .single();

    if (updateError) {
        return Response.json({ error: updateError.message }, { status: 500 });
    }

    await reverseOrderFinancialsAndStock(id, (order as any).vendor_id);

    const customerPhone = (order as any)?.customer?.phone as string | undefined;
    const orderRef = (order as any).order_number || id;
    if (customerPhone) {
        try {
            await notifyOrderCancelled(customerPhone, orderRef, reason);
        } catch (notificationError) {
            console.error('[POST /api/orders/:id/cancel] notification failed', notificationError);
        }
    }

    return Response.json(updated);
}
