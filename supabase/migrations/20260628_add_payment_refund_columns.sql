-- Adds the column needed to mark a payment as refunded when an order is
-- cancelled/failed after payment was already collected (see
-- frontend/src/app/api/orders/[id]/status/route.ts).

ALTER TABLE IF EXISTS payments
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
