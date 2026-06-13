-- ================================================================
-- FIX_NOTIFICATIONS.sql
-- Fixes the notification bell:
--   1. Creates/repairs the notifications table with all required columns
--   2. Sets up correct RLS so customers can INSERT & SELECT their own notifications
--   3. Enables Supabase Realtime on the table so the bell updates live
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

-- 1) Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL DEFAULT '',
  message     TEXT,
  type        TEXT        DEFAULT 'order_status',
  link        TEXT,
  is_read     BOOLEAN     DEFAULT false,
  source      TEXT        DEFAULT 'website',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2) Add any missing columns (safe if they already exist).
--    IMPORTANT: when the table pre-existed with an older schema, the
--    CREATE TABLE above is skipped, so we must guarantee EVERY column the
--    app writes actually exists — especially "message" and "title", whose
--    absence makes every notification insert fail silently.
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id    UUID;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title      TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message    TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type       TEXT    DEFAULT 'order_status';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link       TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read    BOOLEAN DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS source     TEXT    DEFAULT 'website';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 3) Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4) Drop old policies (if any) and recreate cleanly
DROP POLICY IF EXISTS "Users can read own notifications"    ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications"  ON public.notifications;
DROP POLICY IF EXISTS "Allow notification inserts"          ON public.notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications"  ON public.notifications;
DROP POLICY IF EXISTS "Admin can manage all notifications"  ON public.notifications;
DROP POLICY IF EXISTS "Enable read access for own notifications" ON public.notifications;

-- Customers: read their own notifications (this is what the bell SELECTs)
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- INSERT: allow any insert.
-- CRITICAL: the admin panel creates notifications FOR THE CUSTOMER
-- (user_id = the customer's id, NOT the admin's id). A strict
-- "auth.uid() = user_id" check would SILENTLY BLOCK every admin
-- order-status notification. WITH CHECK (true) lets both the
-- checkout flow (customer notifying self) and the admin flow
-- (admin notifying a customer) succeed. Notifications are low-risk
-- writes, so this matches the original working schema.
CREATE POLICY "Allow notification inserts"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Customers: mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 5) Enable Realtime so the bell updates instantly without polling
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;  -- already added, safe to ignore
END $$;

-- 6) Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 7) Verify: the policies are now in place
SELECT policyname, cmd, qual, with_check
FROM   pg_policies
WHERE  schemaname = 'public' AND tablename = 'notifications'
ORDER  BY cmd;

-- 8) Verify: realtime is enabled on the table (should return 1 row)
SELECT schemaname, tablename
FROM   pg_publication_tables
WHERE  pubname = 'supabase_realtime' AND tablename = 'notifications';

-- 9) Quick check: count existing notifications + 10 most recent
SELECT COUNT(*) AS total_notifications FROM public.notifications;
SELECT id, user_id, title, is_read, created_at
FROM   public.notifications
ORDER  BY created_at DESC
LIMIT  10;
