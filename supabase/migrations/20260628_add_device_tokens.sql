-- Device tokens for push notifications (FCM).
-- One vendor can have multiple tokens (multiple devices/reinstalls);
-- token is unique so re-registering the same device just refreshes it.

CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'android' CHECK (platform IN ('android', 'ios')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_vendor_id ON device_tokens(vendor_id);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Vendors can manage only their own device tokens.
DROP POLICY IF EXISTS "Vendors can insert own device tokens" ON device_tokens;
CREATE POLICY "Vendors can insert own device tokens"
ON device_tokens FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Vendors can view own device tokens" ON device_tokens;
CREATE POLICY "Vendors can view own device tokens"
ON device_tokens FOR SELECT
TO authenticated
USING (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Vendors can update own device tokens" ON device_tokens;
CREATE POLICY "Vendors can update own device tokens"
ON device_tokens FOR UPDATE
TO authenticated
USING (auth.uid() = vendor_id)
WITH CHECK (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Vendors can delete own device tokens" ON device_tokens;
CREATE POLICY "Vendors can delete own device tokens"
ON device_tokens FOR DELETE
TO authenticated
USING (auth.uid() = vendor_id);

CREATE OR REPLACE FUNCTION update_device_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_device_tokens_updated_at ON device_tokens;
CREATE TRIGGER trg_device_tokens_updated_at
BEFORE UPDATE ON device_tokens
FOR EACH ROW EXECUTE FUNCTION update_device_tokens_updated_at();
