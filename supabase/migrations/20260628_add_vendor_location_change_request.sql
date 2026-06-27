-- A vendor can propose a new pickup/service location, but it only takes
-- effect once Can Can approves it (prevents a vendor silently moving their
-- service area / gaming geo-based nearest-vendor matching).

ALTER TABLE IF EXISTS vendors
  ADD COLUMN IF NOT EXISTS pending_latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS pending_longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS pending_address TEXT,
  ADD COLUMN IF NOT EXISTS location_change_status TEXT
    CHECK (location_change_status IN ('none', 'pending', 'approved', 'rejected'))
    DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS location_change_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS location_change_reviewed_at TIMESTAMPTZ;
