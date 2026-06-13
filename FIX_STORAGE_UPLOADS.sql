-- ================================================================
-- FIX_STORAGE_UPLOADS.sql
-- Lets the admin upload files in Streams (videos), Banners & Stories
-- (images), and Products (images). Without these storage policies,
-- uploads fail with "new row violates row-level security policy"
-- because they write to the storage.objects table.
--
-- Buckets used by the app:
--   products    -> product images
--   banner      -> stream videos, banner images, story images
--   app-images  -> legacy uploads (kept public for existing media)
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

-- 1) Make sure each bucket exists and is public
INSERT INTO storage.buckets (id, name, public) VALUES ('products',   'products',   true)
  ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('banner',     'banner',     true)
  ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('app-images', 'app-images', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

-- 2) Allow read + upload (insert/update/delete) on each bucket
DROP POLICY IF EXISTS "products_bucket_all" ON storage.objects;
CREATE POLICY "products_bucket_all" ON storage.objects FOR ALL
  USING (bucket_id = 'products') WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "banner_bucket_all" ON storage.objects;
CREATE POLICY "banner_bucket_all" ON storage.objects FOR ALL
  USING (bucket_id = 'banner') WITH CHECK (bucket_id = 'banner');

DROP POLICY IF EXISTS "app_images_bucket_all" ON storage.objects;
CREATE POLICY "app_images_bucket_all" ON storage.objects FOR ALL
  USING (bucket_id = 'app-images') WITH CHECK (bucket_id = 'app-images');

-- 3) Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- 4) Verify the bucket policies exist
SELECT policyname, cmd
FROM   pg_policies
WHERE  schemaname = 'storage' AND tablename = 'objects'
  AND  policyname IN ('products_bucket_all', 'banner_bucket_all', 'app_images_bucket_all')
ORDER  BY policyname;
