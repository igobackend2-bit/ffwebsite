-- Lets a customer request that their account be deleted, and lets admin
-- review those requests from a new "Account Requests" page and either
-- approve (permanently deletes the account) or reject (dismisses the
-- request, account untouched).
--
-- Approving a request deletes the customer's auth.users row. Every table
-- in this project that references auth.users already does so with
-- "ON DELETE CASCADE" (profiles, cart, orders, wishlist, user_addresses,
-- notifications, stock_notifications, reviews) — so deleting that one row
-- automatically removes everything tied to that customer's account too.
-- Nothing else needs to be deleted by hand, and no existing table is
-- changed by this migration.
--
-- Run this once in the Supabase SQL Editor. Purely additive.

CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  email TEXT,
  full_name TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' — approved requests are removed once the account is deleted; rejected requests are removed on dismissal
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_pending
  ON account_deletion_requests (status)
  WHERE status = 'pending';

ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- A customer can see and create their own request.
DROP POLICY IF EXISTS "Users manage their own deletion request" ON account_deletion_requests;
CREATE POLICY "Users manage their own deletion request"
  ON account_deletion_requests
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin review/approve/reject happens through the service-role key, which
-- bypasses RLS entirely, so no separate admin policy is required here.
