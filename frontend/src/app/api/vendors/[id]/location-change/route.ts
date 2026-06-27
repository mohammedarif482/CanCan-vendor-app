import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateVendorBySupabaseToken, authenticateAdmin, unauthorized, forbidden } from '@/lib/auth';

/**
 * POST: vendor proposes a new service location. Does NOT move the vendor's
 * live latitude/longitude — only sets pending_* fields + status='pending'.
 * The live location is only updated once an admin approves (see PATCH).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const vendor = await authenticateVendorBySupabaseToken(req);
    if (!vendor) return unauthorized();

    const { id } = await params;
    if (vendor.vendorId !== id) return forbidden('You do not own this vendor account');

    const { latitude, longitude, address } = await req.json();
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return Response.json({ error: 'latitude and longitude are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('vendors')
        .update({
            pending_latitude: latitude,
            pending_longitude: longitude,
            pending_address: address || null,
            location_change_status: 'pending',
            location_change_requested_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
}

/**
 * PATCH: admin approves or rejects a pending location change.
 * { decision: 'approved' | 'rejected' }
 * On approval, copies pending_* into the live latitude/longitude/address.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await authenticateAdmin(req);
    if (!admin) return unauthorized();

    const { id } = await params;
    const { decision } = await req.json();
    if (decision !== 'approved' && decision !== 'rejected') {
        return Response.json({ error: "decision must be 'approved' or 'rejected'" }, { status: 400 });
    }

    const { data: vendor, error: fetchError } = await supabaseAdmin
        .from('vendors')
        .select('pending_latitude, pending_longitude, pending_address, location_change_status')
        .eq('id', id)
        .maybeSingle();

    if (fetchError || !vendor) {
        return Response.json({ error: 'Vendor not found' }, { status: 404 });
    }
    if ((vendor as any).location_change_status !== 'pending') {
        return Response.json({ error: 'No pending location change for this vendor' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
        location_change_status: decision,
        location_change_reviewed_at: new Date().toISOString(),
    };

    if (decision === 'approved') {
        updatePayload.latitude = (vendor as any).pending_latitude;
        updatePayload.longitude = (vendor as any).pending_longitude;
        if ((vendor as any).pending_address) {
            updatePayload.address = (vendor as any).pending_address;
        }
    }

    const { data: updated, error: updateError } = await supabaseAdmin
        .from('vendors')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
    return Response.json(updated);
}
