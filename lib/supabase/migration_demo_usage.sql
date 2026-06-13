-- Run this in Supabase SQL editor to enable the guest demo feature
-- https://supabase.com/dashboard/project/rqbovrpypurwxuwhypce/sql/new

CREATE TABLE IF NOT EXISTS demo_usage (
  ip_hash text PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE demo_usage ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to check if their hash exists
CREATE POLICY "anon_select" ON demo_usage
  FOR SELECT USING (true);

-- Allow anonymous users to insert their hash
CREATE POLICY "anon_insert" ON demo_usage
  FOR INSERT WITH CHECK (true);
