-- ================================================================
-- FIX_ADMIN_LOGIN.sql
-- Fixes: "new row violates row-level security policy" and
--        "Session expired. Please log in to the admin panel again."
--        when adding/editing banners, stories, streams, products.
--
-- Cause: the admin auth user is missing/broken in this Supabase
-- project, so the admin panel has no real database session and all
-- writes are blocked by row-level security.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- AFTER RUNNING: in the admin panel click Logout, then log in
-- again at /admin/login. Then try adding a banner/story/stream.
-- Safe to run multiple times.
-- ================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------
-- 1) Ensure the admin auth user exists, is confirmed, and has the
--    password the website code uses.
-- ----------------------------------------------------------------
DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'admin@famersfactory.com';

  IF uid IS NULL THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token,
      email_change, email_change_token_new
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'admin@famersfactory.com', crypt('AdminPassword123!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', '{}',
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), uid, uid::text,
      jsonb_build_object('sub', uid::text, 'email', 'admin@famersfactory.com', 'email_verified', true),
      'email', now(), now(), now()
    );
  ELSE
    -- User exists: reset password to what the website code expects
    -- and make sure the account is confirmed.
    UPDATE auth.users
    SET encrypted_password = crypt('AdminPassword123!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        banned_until = NULL
    WHERE id = uid;
  END IF;

  -- Ensure the admin has an admin profile (used by security policies)
  BEGIN
    INSERT INTO public.profiles (id, role) VALUES (uid, 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'profiles upsert skipped: %', SQLERRM;
  END;
END $$;

-- ----------------------------------------------------------------
-- 2) Helper: is the current user an admin? (SECURITY DEFINER avoids
--    RLS recursion problems)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ff_is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ----------------------------------------------------------------
-- 3) Tighten content write policies: ONLY the admin can write
--    (replaces the broader "any signed-in user" policies from
--    FIX_LIVE_SCHEMA.sql). Public can still read.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "ff_banners_auth_write" ON public.banners;
DROP POLICY IF EXISTS "ff_banners_admin_write" ON public.banners;
CREATE POLICY "ff_banners_admin_write" ON public.banners
  FOR ALL TO authenticated USING (public.ff_is_admin()) WITH CHECK (public.ff_is_admin());

DROP POLICY IF EXISTS "ff_streams_auth_write" ON public.farm_streams;
DROP POLICY IF EXISTS "ff_streams_admin_write" ON public.farm_streams;
CREATE POLICY "ff_streams_admin_write" ON public.farm_streams
  FOR ALL TO authenticated USING (public.ff_is_admin()) WITH CHECK (public.ff_is_admin());

DROP POLICY IF EXISTS "ff_stories_auth_write" ON public.farm_stories;
DROP POLICY IF EXISTS "ff_stories_admin_write" ON public.farm_stories;
CREATE POLICY "ff_stories_admin_write" ON public.farm_stories
  FOR ALL TO authenticated USING (public.ff_is_admin()) WITH CHECK (public.ff_is_admin());

-- Products: add an admin write policy too (covers product editing
-- if row-level security is enabled on the products table).
DROP POLICY IF EXISTS "ff_products_admin_write" ON public.products;
CREATE POLICY "ff_products_admin_write" ON public.products
  FOR ALL TO authenticated USING (public.ff_is_admin()) WITH CHECK (public.ff_is_admin());

-- ----------------------------------------------------------------
-- 4) Storage uploads: admin only (replaces the broader policies).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "ff_storage_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "ff_storage_admin_insert" ON storage.objects;
CREATE POLICY "ff_storage_admin_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('products', 'banner') AND public.ff_is_admin());

DROP POLICY IF EXISTS "ff_storage_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "ff_storage_admin_update" ON storage.objects;
CREATE POLICY "ff_storage_admin_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('products', 'banner') AND public.ff_is_admin());

DROP POLICY IF EXISTS "ff_storage_auth_delete" ON storage.objects;
DROP POLICY IF EXISTS "ff_storage_admin_delete" ON storage.objects;
CREATE POLICY "ff_storage_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('products', 'banner') AND public.ff_is_admin());

-- ----------------------------------------------------------------
-- 5) Refresh API schema cache.
-- ----------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- Done. Now LOG OUT of the admin panel and LOG IN again.
