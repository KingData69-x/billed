-- Run this in Supabase SQL editor to add payment method columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_bank_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_bank_account text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_bank_routing text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_paypal text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_venmo text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_cashapp text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_other text;
