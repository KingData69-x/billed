-- Referral codes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by  text;

-- Auto-generate code for any existing profiles missing one
UPDATE profiles
SET referral_code = substring(encode(digest(id::text || extract(epoch from now())::text, 'sha256'), 'hex'), 1, 8)
WHERE referral_code IS NULL;

-- Trigger: auto-assign a referral code on every new profile insert
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := substring(
      encode(digest(NEW.id::text || extract(epoch from now())::text, 'sha256'), 'hex'),
      1, 8
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_referral_code ON profiles;
CREATE TRIGGER auto_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_referral_code();

-- Public share token on invoices (null = private, uuid = publicly shareable)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS public_token uuid;
CREATE UNIQUE INDEX IF NOT EXISTS invoices_public_token_idx
  ON invoices(public_token) WHERE public_token IS NOT NULL;

-- Allow anyone to read an invoice by its public_token (no auth required)
CREATE POLICY "public_view_by_token" ON invoices
  FOR SELECT
  USING (public_token IS NOT NULL);
