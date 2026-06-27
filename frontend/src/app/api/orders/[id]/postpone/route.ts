import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateVendorBySupabaseToken, unauthorized, forbidden } from '@/lib/auth';
import { notifyOrderPostponed } from '@/lib/whatsapp-notifications';

/**
 * Vendor-facing: push an order's delivery_date forward by one day and tell
 * the customer on WhatsApp. Only the owning vendor can postpone their own order.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const vendor = await authenticateVendorBySupabaseToken(req);
    if (!vendor) return unauthorized();

    const { id } = await params;

    const { data: order, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('id, vendor_id, status, delivery_date, order_number, customer:customers(phone)')
        .eq('id', id)
        .maybeSingle();

    if (fetchError || !order) {
        return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    if ((order as any).vendor_id !== vendor.vendorId) {
        return forbidden('You do not own this order');
    }
    if ((order as any).status === 'delivered' || (order as any).status === 'completed') {
        return Response.json({ error: 'Order already delivered — cannot postpone' }, { status: 400 });
    }

    const currentDate = new Date((order as any).delivery_date);
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    const { data: updated, error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ delivery_date: nextDateStr })
        .eq('id', id)
        .select()
        .single();

    if (updateError) {
        return Response.json({ error: updateError.message }, { status: 500 });
    }

    const customerPhone = (order as any)?.customer?.phone as string | undefined;
    const orderRef = (order as any).order_number || id;
    if (customerPhone) {
        try {
            await notifyOrderPostponed(customerPhone, orderRef, nextDateStr);
        } catch (notificationError) {
            console.error('[POST /api/orders/:id/postpone] notification failed', notificationError);
        }
    }

    return Response.json(updated);
}
