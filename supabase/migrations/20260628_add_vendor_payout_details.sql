-- Bank/UPI details required to create a Cashfree Payouts beneficiary for
-- each vendor, plus a cache of the beneficiary id once created (Cashfree
-- beneficiary creation is a one-time step per vendor, not per payout).

ALTER TABLE IF EXISTS vendors
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_ifsc TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_holder_name TEXT,
  ADD COLUMN IF NOT EXISTS payout_vpa TEXT,
  ADD COLUMN IF NOT EXISTS cf_beneficiary_id TEXT;
