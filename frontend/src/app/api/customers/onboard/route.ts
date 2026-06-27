import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        if (isRateLimited(`onboard:${ip}`, 20, 60 * 60 * 1000)) {
            return Response.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
        }

        const body = await req.json();
        const {
            phone,
            vendorId,
            name,
            address,
            flatNumber,
            floor,
            buildingName,
            landmark,
            latitude,
            longitude,
            city,
            state,
            pincode,
        } = body;

        // Validate required fields
        if (!phone || !name || !address || !vendorId) {
            return Response.json(
                { error: 'Missing required fields: phone, name, address, vendorId' },
                { status: 400 }
            );
        }

        if (isRateLimited(`onboard:phone:${phone}`, 5, 60 * 60 * 1000)) {
            return Response.json({ error: 'Too many requests for this phone number. Try again later.' }, { status: 429 });
        }

        // Validate vendor exists
        const { data: vendor, error: vendorError } = await supabaseAdmin
            .from('vendors')
            .select('id, business_name')
            .eq('id', vendorId)
            .single();

        if (vendorError || !vendor) {
            return Response.json({ error: 'Vendor not found' }, { status: 404 });
        }

        // If this phone is already a known customer, do NOT let an
        // unauthenticated onboarding POST silently overwrite their existing
        // name/address (anyone who guesses/knows a phone number could
        // otherwise corrupt a real customer's profile). Just link them to
        // the new vendor and return their existing record untouched.
        const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('phone', phone)
            .maybeSingle();

        let customer = existingCustomer;
        let customerError: { message: string } | null = null;

        if (!existingCustomer) {
            const inserted = await supabaseAdmin
                .from('customers')
                .insert({
                    phone,
                    name,
                    address,
                    flat_number: flatNumber || null,
                    floor: floor || null,
                    building_name: buildingName || null,
                    landmark: landmark || null,
                    latitude: latitude || null,
                    longitude: longitude || null,
                    city: city || null,
                    state: state || null,
                    pincode: pincode || null,
                    is_verified: true,
                    verification_status: 'verified',
                })
                .select()
                .single();
            customer = inserted.data;
            customerError = inserted.error;
        }

        if (customerError || !customer) {
            console.error('Customer upsert error:', customerError);
            return Response.json(
                { error: 'Failed to save customer details' },
                { status: 500 }
            );
        }

        // Link customer to vendor (ignore if already linked)
        await supabaseAdmin
            .from('customer_vendors')
            .upsert(
                {
                    customer_id: customer.id,
                    vendor_id: vendorId,
                    referral_source: 'qr_code',
                },
                { onConflict: 'customer_id,vendor_id' }
            );

        // Send WhatsApp confirmation to the customer
        try {
            await sendWhatsAppMessage(
                phone,
                `✅ Welcome to Can Can, ${name}! You're now connected with ${vendor.business_name}.\n\nSend "order" anytime to place a new water can order. 🚰`
            );
        } catch (whatsappError) {
            // Don't fail the onboarding if WhatsApp message fails
            console.warn('WhatsApp confirmation failed:', whatsappError);
        }

        return Response.json({
            success: true,
            message: 'Customer onboarded successfully',
            customer: {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
            },
            vendor: {
                id: vendor.id,
                businessName: vendor.business_name,
            },
        });
    } catch (error) {
        console.error('Onboarding error:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
