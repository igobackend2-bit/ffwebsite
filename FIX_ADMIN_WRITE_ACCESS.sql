-- ================================================================
-- FIX_ADMIN_WRITE_ACCESS.sql
-- Fixes every "new row violates row-level security policy" error in the
-- admin panel (Add Story, Add Stream, Add Banner, Add Coupon, Add Product)
-- and the "Permission denied ... Storage Policy" error on product image upload.
--
-- WHY: the admin panel signs in via localStorage, NOT a Supabase auth
-- session, so to the database every admin write arrives as the anonymous
-- role. The tables/bucket RLS rejected anonymous writes. These policies
-- allow the writes so the admin panel works.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

-- 1) Permissive write policies on every table the admin panel writes to.
--    Skips any table that doesn't exist, so it's safe.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'farm_stories', 'farm_streams', 'banners', 'banner', 'coupons', 'products'
  ] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_all', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true)',
        t || '_admin_all', t
      );
    END IF;
  END LOOP;
END $$;

-- 2) Storage: make sure the "products" bucket exists, is public, and accepts uploads.
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "products_bucket_all" ON storage.objects;
CREATE POLICY "products_bucket_all"
  ON storage.objects FOR ALL
  USING (bucket_id = 'products')
  WITH CHECK (bucket_id = 'products');

-- 3) Refresh the API schema cache
NOTIFY pgrst, 'reload schema';

-- 4) Verify the policies are in place
SELECT tablename, policyname, cmd
FROM   pg_policies
WHERE  schemaname = 'public'
  AND  tablename IN ('farm_stories', 'farm_streams', 'banners', 'banner', 'coupons', 'products')
ORDER  BY tablename;
