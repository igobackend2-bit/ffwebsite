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

-- 2) Add any missing columns (safe if they already exist)
DO $$ BEGIN
  BEGIN ALTER TABLE public.notifications ADD COLUMN source TEXT DEFAULT 'website';   EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.notifications ADD COLUMN type TEXT DEFAULT 'order_status'; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.notifications ADD COLUMN link TEXT;                        EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.notifications ADD COLUMN is_read BOOLEAN DEFAULT false;    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- 3) Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4) Drop old policies (if any) and recreate cleanly
DROP POLICY IF EXISTS "Users can read own notifications"    ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications"  ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications"  ON public.notifications;
DROP POLICY IF EXISTS "Admin can manage all notifications"  ON public.notifications;
DROP POLICY IF EXISTS "Enable read access for own notifications" ON public.notifications;

-- Customers: read their own notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Customers: create their own notifications (checkout inserts as logged-in user)
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Customers: mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin: full access
CREATE POLICY "Admin can manage all notifications"
  ON public.notifications FOR ALL
  USING (ff_is_admin());

-- 5) Enable Realtime so the bell updates instantly without polling
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;  -- already added, safe to ignore
END $$;

-- 6) Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 7) Quick check: count existing notifications
SELECT COUNT(*) AS total_notifications FROM public.notifications;
