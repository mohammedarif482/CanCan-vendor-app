-- =====================================================
-- Remove test-mode RLS bypass on vendors
-- =====================================================
-- Prior migrations (database/supabase_add_test_mode_policies.sql,
-- database/supabase_test_mode_fixed.sql) added:
--   1. An INSERT policy for the `anon` role that allows creating a
--      vendor row whenever the client sets test_mode = true.
--   2. `OR test_mode = true` clauses on the SELECT/UPDATE policies,
--      which let ANY authenticated user read/update ANY OTHER
--      vendor's row as long as that row has test_mode = true.
--
-- Neither is needed: the Flutter test-OTP flow (lib/services/auth_service.dart)
-- still creates a real Supabase session and inserts with
-- `id = auth.uid()` (lib/services/vendor_service.dart), so the
-- standard owner-only policies already cover it. The bypass clauses
-- only added a cross-tenant data leak / unauthenticated-write hole.
-- =====================================================

DROP POLICY IF EXISTS "Enable test mode vendor creation" ON vendors;

DROP POLICY IF EXISTS "Vendors can insert own profile" ON vendors;
CREATE POLICY "Vendors can insert own profile"
ON vendors
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Vendors can view own profile" ON vendors;
CREATE POLICY "Vendors can view own profile"
ON vendors
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Vendors can update own profile" ON vendors;
CREATE POLICY "Vendors can update own profile"
ON vendors
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- test_mode column is kept (still used for logging/analytics) but no
-- longer participates in any RLS decision.
