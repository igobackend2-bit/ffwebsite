-- ================================================================
-- FIX_PROFILE_NOTIFICATION_COLUMNS.sql
-- Adds the notification-preference columns that Profile Settings expects
-- on public.profiles. These are defined in supabase_schema.sql but appear
-- to be missing on the live database, causing:
--   "Could not find the 'email_notifications_enabled' column of
--    'profiles' in the schema cache"
-- whenever a customer clicked "Save Changes" on their Profile Settings page.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT TRUE;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS in_app_notifications_enabled BOOLEAN DEFAULT TRUE;

NOTIFY pgrst, 'reload schema';

-- Verify
SELECT column_name, data_type, column_default
FROM   information_schema.columns
WHERE  table_schema = 'public' AND table_name = 'profiles'
  AND  column_name IN ('email_notifications_enabled', 'in_app_notifications_enabled');
