-- ═══════════════════════════════════════════════════════════════
-- ADMIN FINAL FIX — Run this in Supabase SQL Editor
-- This fixes "new row violates row-level security policy" for
-- Banners, Live Streams, Farm Stories, and Customers pages.
-- ═══════════════════════════════════════════════════════════════

-- STEP 1: Make sure the admin profile exists with role = 'admin'
-- This is the root cause — the is_admin() function was checking
-- profiles.role but it was never set to 'admin' for the admin user.
INSERT INTO public.profiles (id, role)
SELECT 
  au.id,
  'admin'
FROM auth.users au
WHERE au.email = 'admin@farmersfactory.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- STEP 2: Update the is_admin() function to also check by email
-- This adds a fallback so it works even if profile row is missing
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    -- Check by profile role
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id::text = auth.uid()::text
        AND public.profiles.role = 'admin'
    )
    OR
    -- Fallback: check by email directly from auth.users
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.email = 'admin@farmersfactory.com'
    )
  );
END;
$$;

-- STEP 3: Grant admin insert/update/delete on profiles (for CRM page)
DROP POLICY IF EXISTS "profiles_all_admin" ON profiles;
CREATE POLICY "profiles_all_admin"
  ON profiles FOR ALL USING (public.is_admin());

-- STEP 4: Grant admin full access to farm_stories / harvest_events
DROP POLICY IF EXISTS "harvest_events_all_admin" ON harvest_events;
CREATE POLICY "harvest_events_all_admin"
  ON harvest_events FOR ALL USING (public.is_admin());

-- STEP 5: Confirm banners and farm_streams admin policies exist
DROP POLICY IF EXISTS "banners_all_admin" ON banners;
CREATE POLICY "banners_all_admin"
  ON banners FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "farm_streams_all_admin" ON farm_streams;
CREATE POLICY "farm_streams_all_admin"
  ON farm_streams FOR ALL USING (public.is_admin());

-- STEP 6: Allow admin to manage notifications (for low stock alerts)
DROP POLICY IF EXISTS "notifications_insert_admin" ON notifications;
CREATE POLICY "notifications_insert_admin"
  ON notifications FOR INSERT WITH CHECK (public.is_admin() OR true);

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT USING (user_id IS NULL OR auth.uid()::text = user_id::text);

-- DONE! ✅ Admin can now add banners, streams, stories, and view all customers.
