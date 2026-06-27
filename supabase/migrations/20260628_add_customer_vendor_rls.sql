-- customers has RLS enabled (database/unified_schema.sql) but no policies
-- were ever defined for it there or in supabase/migrations — meaning, on a
-- DB built from that file alone, vendors have ZERO read access to their own
-- customers via the authenticated/anon client (only supabaseAdmin/service-role
-- bypasses RLS). The vendor app's new Customer Database screen needs this.
--
-- Scoped via customer_vendors (the actual current linking table used by the
-- WhatsApp webhook) rather than orders, since a customer can be linked to a
-- vendor (QR onboarding) before ever placing an order.

DROP POLICY IF EXISTS "Vendors can view linked customers" ON customers;
CREATE POLICY "Vendors can view linked customers" ON customers
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM customer_vendors
    WHERE customer_vendors.customer_id = customers.id
      AND customer_vendors.vendor_id = auth.uid()
  )
);

-- Lets a vendor edit delivery-relevant fields (floor, lift access, deposit
-- amount, etc) for their own linked customers. RLS can't restrict to
-- specific columns, so this trusts the client to only send the fields the
-- Customer Database screen actually exposes for editing.
DROP POLICY IF EXISTS "Vendors can update linked customers" ON customers;
CREATE POLICY "Vendors can update linked customers" ON customers
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customer_vendors
    WHERE customer_vendors.customer_id = customers.id
      AND customer_vendors.vendor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM customer_vendors
    WHERE customer_vendors.customer_id = customers.id
      AND customer_vendors.vendor_id = auth.uid()
  )
);
