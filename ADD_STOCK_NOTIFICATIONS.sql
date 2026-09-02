-- Adds "Notify Me" support: lets a customer ask to be told when a
-- sold-out product is back in stock, and lets admin's restock actions
-- (Products page toggle/bulk actions, Inventory page stock editor) fan
-- that out as a real notification once it happens.
--
-- Run this once in the Supabase SQL Editor. Purely additive — creates one
-- new table and its policies; does not touch any existing table.

CREATE TABLE IF NOT EXISTS stock_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified_at TIMESTAMP WITH TIME ZONE, -- set once the "back in stock" notification has been sent; NULL = still waiting
  UNIQUE (product_id, user_id) -- a customer only needs to ask once per product
);

CREATE INDEX IF NOT EXISTS idx_stock_notifications_pending
  ON stock_notifications (product_id)
  WHERE notified_at IS NULL;

ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;

-- A customer can see, create, and cancel their own "notify me" requests.
DROP POLICY IF EXISTS "Users manage their own stock notifications" ON stock_notifications;
CREATE POLICY "Users manage their own stock notifications"
  ON stock_notifications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- The admin restock-notification route uses the service-role key, which
-- bypasses RLS entirely, so no separate admin policy is required here.
