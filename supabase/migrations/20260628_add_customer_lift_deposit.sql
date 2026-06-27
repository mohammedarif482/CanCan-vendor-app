-- Vendor-facing customer database needs lift-access (affects delivery
-- effort/time) and deposit-amount (refundable can deposit collected from
-- the customer) — neither existed on customers before.

ALTER TABLE IF EXISTS customers
  ADD COLUMN IF NOT EXISTS has_lift BOOLEAN,
  ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10, 2) DEFAULT 0.0;
