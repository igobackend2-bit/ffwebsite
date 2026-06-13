-- ================================================================
-- FIX_ADMIN_PERMISSIONS.sql
-- Fixes: "new row violates row-level security policy" and
--        "Permission denied ... products bucket" on ALL admin saves
--        (products, banners, stories, streams, uploads).
--
-- Cause: admin rights were checked only via profiles.role = 'admin',
-- and your ERP app (sharing this database) appears to have changed
-- that role. This makes the admin check recognise the admin account
-- by its login email as well, so the ERP can never break it again.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- AFTER RUNNING: in the admin panel click Logout, then log in again.
-- Safe to run multiple times.
-- ================================================================

-- 1) Restore the admin role on the profile (belt)
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@famersfactory.com');

-- 2) Make the admin check immune to profile changes (braces):
--    admin = the admin email account OR any profile with role 'admin'
CREATE OR REPLACE FUNCTION public.ff_is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
      AND (
        u.email = 'admin@famersfactory.com'
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id AND p.role = 'admin')
      )
  );
$$;

-- 3) Refresh API schema cache
NOTIFY pgrst, 'reload schema';

-- 4) Verify: shows the admin account and its profile role
SELECT u.email, u.id, p.role AS profile_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@famersfactory.com';
