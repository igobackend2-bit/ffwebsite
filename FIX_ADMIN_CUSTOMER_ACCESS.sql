-- ================================================================
-- FIX_ADMIN_CUSTOMER_ACCESS.sql
-- Lets the admin panel read customer details (name + email) so the
-- Orders page stops showing "Customer (Unknown)" and customer search
-- by email works.
--
-- Background: orders already store the name / phone / address inside
-- delivery_address (the app now parses that as a fallback), but the
-- customer's EMAIL lives in the profiles / users tables. Those tables
-- have RLS that only lets a user read their OWN row, so the admin
-- cannot see other customers' profiles. This adds an admin-read policy.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

-- 1) Admin detector function (reuse if it already exists)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  );
$$;

-- 2) profiles: allow admins to read every profile (keep own-row access too)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.is_admin() OR auth.uid() = id);

-- 3) users mirror (only if it is a real BASE TABLE).
--    NOTE: in this project public.users is a VIEW, so RLS does not apply
--    to it (views inherit access from their underlying tables). This block
--    only acts when public.users is an actual table, and is skipped for views.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public'
               AND table_name = 'users'
               AND table_type = 'BASE TABLE') THEN
    EXECUTE 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "users_select_admin" ON public.users';
    EXECUTE 'CREATE POLICY "users_select_admin" ON public.users
             FOR SELECT USING (public.is_admin() OR auth.uid() = id)';
  END IF;
END $$;

-- 4) Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 5) Verify the policies exist
SELECT tablename, policyname, cmd
FROM   pg_policies
WHERE  schemaname = 'public'
  AND  tablename IN ('profiles', 'users')
ORDER  BY tablename, cmd;
