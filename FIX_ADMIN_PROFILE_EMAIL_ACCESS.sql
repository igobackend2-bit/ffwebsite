-- ================================================================
-- FIX_ADMIN_PROFILE_EMAIL_ACCESS.sql
--
-- Fixes: admin panel showing "No email on file" for customers who
-- DO have an email saved in their own profile (visible on their own
-- /profile page), even though the admin's Orders/Customers views say
-- otherwise.
--
-- Root cause: FIX_ADMIN_CUSTOMER_ACCESS.sql originally granted admin
-- read access to public.profiles via a policy that checks
-- public.is_admin() — a function that only checks profiles.role =
-- 'admin'. FIX_ADMIN_PERMISSIONS.sql later replaced that check
-- elsewhere with the sturdier public.ff_is_admin() (admin email OR
-- profiles.role), specifically because the ERP sharing this database
-- had overwritten the role column and broken the old check — but it
-- never updated this one policy on profiles itself. So this table's
-- read policy has been quietly running on the fragile check ever
-- since, which is why admin can see everything else but not other
-- customers' emails.
--
-- This does not change any application code — it only repoints the
-- existing profiles_select_admin policy at the already-proven
-- ff_is_admin() function, same one every other admin-facing table
-- (including the new feedback table) already relies on.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.ff_is_admin() OR auth.uid() = id);

-- Same fix for the users mirror table, if it's a real table (not a view)
-- in your project — mirrors the same guard FIX_ADMIN_CUSTOMER_ACCESS.sql
-- already used.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public'
               AND table_name = 'users'
               AND table_type = 'BASE TABLE') THEN
    EXECUTE 'DROP POLICY IF EXISTS "users_select_admin" ON public.users';
    EXECUTE 'CREATE POLICY "users_select_admin" ON public.users
             FOR SELECT USING (public.ff_is_admin() OR auth.uid() = id)';
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

-- Verify: policy should now reference ff_is_admin, not is_admin
SELECT tablename, policyname, cmd, qual
FROM   pg_policies
WHERE  schemaname = 'public'
  AND  tablename IN ('profiles', 'users')
ORDER  BY tablename, cmd;
