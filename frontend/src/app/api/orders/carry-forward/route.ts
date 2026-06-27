import { NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { notifyOrderCarriedForward } from '@/lib/whatsapp-notifications';

/**
 * Daily job: any order still 'pending' (not delivered, not cancelled) whose
 * delivery_date is in the past gets rolled forward to today, and the
 * customer is notified. Wire this up as a Vercel cron hitting this route
 * once a day (see vercel.json `crons`) — Vercel cron requests aren't
 * otherwise authenticated, so this checks a shared secret instead.
 */

function timingSafeCompare(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) {
        crypto.timingSafeEqual(aBuf, aBuf);
        return false;
    }
    return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function GET(req: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return Response.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization') || '';
    const provided = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
    if (!provided || !timingSafeCompare(provided, secret)) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const { data: overdueOrders, error } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, delivery_date, customer:customers(phone)')
        .eq('status', 'pending')
        .lt('delivery_date', todayStr);

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    let carriedForward = 0;
    const failures: string[] = [];

    for (const order of overdueOrders || []) {
        const orderId = (order as any).id as string;
        try {
            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({ delivery_date: todayStr })
                .eq('id', orderId)
                .eq('status', 'pending'); // re-check status to avoid racing a concurrent vendor action

            if (updateError) throw updateError;

            const customerPhone = (order as any)?.customer?.phone as string | undefined;
            const orderRef = (order as any).order_number || orderId;
            if (customerPhone) {
                await notifyOrderCarriedForward(customerPhone, orderRef, todayStr);
            }
            carriedForward += 1;
        } catch (e) {
            console.error('[carry-forward] failed for order', orderId, e);
            failures.push(orderId);
        }
    }

    return Response.json({
        date: todayStr,
        totalOverdue: (overdueOrders || []).length,
        carriedForward,
        failures,
    });
}
