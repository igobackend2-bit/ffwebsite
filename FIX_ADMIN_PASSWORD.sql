-- ================================================================
-- FIX_ADMIN_PASSWORD.sql
-- Restores your preferred admin panel password (Admin@123).
-- The login page reads it from the site_settings table, which
-- exists in the OLD Supabase project but not in this one.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- AFTER RUNNING: log in at /admin/login with: Admin@123
-- Safe to run multiple times.
-- ================================================================

-- 1) Create the settings table the login page expects
CREATE TABLE IF NOT EXISTS public.site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- 2) Set your admin panel password
INSERT INTO public.site_settings (key, value)
VALUES ('admin_password', 'Admin@123')
ON CONFLICT (key) DO UPDATE SET value = 'Admin@123';

-- 3) Protect the table: the login page must be able to read it,
--    but only the admin can change it.
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ff_settings_public_read" ON public.site_settings;
CREATE POLICY "ff_settings_public_read" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "ff_settings_admin_write" ON public.site_settings;
CREATE POLICY "ff_settings_admin_write" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.ff_is_admin()) WITH CHECK (public.ff_is_admin());

-- 4) Refresh API schema cache
NOTIFY pgrst, 'reload schema';

-- Done. Log in at /admin/login with: Admin@123
