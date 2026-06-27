import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateAdmin, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await authenticateAdmin(req);
    if (!admin) return unauthorized();

    const { id } = await params;

    const { data: customer, error } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 404 });
    }

    return Response.json(customer);
}

// Only these fields may be edited via this endpoint — request body is
// otherwise passed straight to .update() which would let a caller overwrite
// id/phone/total_orders/verification flags etc (mass-assignment).
const EDITABLE_CUSTOMER_FIELDS = [
    'name', 'address', 'flat_number', 'floor', 'building_name', 'landmark',
    'latitude', 'longitude', 'city', 'state', 'pincode', 'notes',
    'is_active', 'preferred_vendor_id',
] as const;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await authenticateAdmin(req);
    if (!admin) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const field of EDITABLE_CUSTOMER_FIELDS) {
        if (field in body) data[field] = body[field];
    }

    const { data: updatedCustomer, error } = await supabaseAdmin
        .from('customers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(updatedCustomer);
}
