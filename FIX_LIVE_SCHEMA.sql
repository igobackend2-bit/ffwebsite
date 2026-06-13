-- ================================================================
-- FIX_LIVE_SCHEMA.sql
-- Aligns the LIVE Supabase database (qwiumswrbddwmlraktvy) with
-- what the website code expects. Fixes:
--   1. Admin cannot edit/save products  (products.video_url missing)
--   2. "Failed to load banners"         (banners columns mismatch)
--   3. "Failed to load farm streams"    (farm_streams.display_order missing)
--   4. "Failed to load farm stories"    (farm_stories table missing)
--   5. Admin image/video uploads        (storage buckets missing)
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> New query ->
--             paste this whole file -> Run.
-- Safe to run multiple times (fully idempotent).
-- ================================================================

-- ----------------------------------------------------------------
-- 1) PRODUCTS - admin "Edit product" fails because the code saves
--    a video_url field that does not exist in the live table.
-- ----------------------------------------------------------------
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url TEXT;

-- ----------------------------------------------------------------
-- 2) BANNERS - admin Banners page and the homepage hero slider
--    expect these columns (live table only has image_url/sort_order).
-- ----------------------------------------------------------------
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS subtitle      TEXT;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS media_url     TEXT;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS media_type    TEXT    DEFAULT 'image';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS cta_text      TEXT;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS cta_link      TEXT;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS display_order INT     DEFAULT 0;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS is_active     BOOLEAN DEFAULT true;

-- Migrate data from the old column names so existing banners keep working
UPDATE public.banners SET media_url  = image_url WHERE media_url IS NULL AND image_url IS NOT NULL;
UPDATE public.banners SET media_type = 'image'   WHERE media_type IS NULL;
UPDATE public.banners SET display_order = COALESCE(sort_order, 0)
WHERE (display_order IS NULL OR display_order = 0) AND sort_order IS NOT NULL;

-- ----------------------------------------------------------------
-- 3) FARM_STREAMS - admin Live Streams page expects these columns.
-- ----------------------------------------------------------------
ALTER TABLE public.farm_streams ADD COLUMN IF NOT EXISTS name          TEXT;
ALTER TABLE public.farm_streams ADD COLUMN IF NOT EXISTS location      TEXT;
ALTER TABLE public.farm_streams ADD COLUMN IF NOT EXISTS video_url     TEXT;
ALTER TABLE public.farm_streams ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.farm_streams ADD COLUMN IF NOT EXISTS temp          TEXT    DEFAULT '28°C';
ALTER TABLE public.farm_streams ADD COLUMN IF NOT EXISTS humidity      TEXT    DEFAULT '65%';
ALTER TABLE public.farm_streams ADD COLUMN IF NOT EXISTS wind          TEXT    DEFAULT '12 km/h';
ALTER TABLE public.farm_streams ADD COLUMN IF NOT EXISTS viewers       INT     DEFAULT 0;
ALTER TABLE public.farm_streams ADD COLUMN IF NOT EXISTS is_active     BOOLEAN DEFAULT true;
ALTER TABLE public.farm_streams ADD COLUMN IF NOT EXISTS display_order INT     DEFAULT 0;

-- ----------------------------------------------------------------
-- 4) FARM_STORIES - table does not exist in the live database.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farm_stories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer        TEXT,
  title         TEXT,
  image_url     TEXT,
  video_url     TEXT,
  is_live       BOOLEAN     DEFAULT true,
  display_order INT         DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------
-- 5) ACCESS POLICIES - public can read, signed-in users can write.
--    (Dormant if RLS is disabled on a table; active if enabled.)
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "ff_banners_public_read"  ON public.banners;
CREATE POLICY "ff_banners_public_read"  ON public.banners      FOR SELECT USING (true);
DROP POLICY IF EXISTS "ff_banners_auth_write"   ON public.banners;
CREATE POLICY "ff_banners_auth_write"   ON public.banners      FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ff_streams_public_read"  ON public.farm_streams;
CREATE POLICY "ff_streams_public_read"  ON public.farm_streams FOR SELECT USING (true);
DROP POLICY IF EXISTS "ff_streams_auth_write"   ON public.farm_streams;
CREATE POLICY "ff_streams_auth_write"   ON public.farm_streams FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ff_stories_public_read"  ON public.farm_stories;
CREATE POLICY "ff_stories_public_read"  ON public.farm_stories FOR SELECT USING (true);
DROP POLICY IF EXISTS "ff_stories_auth_write"   ON public.farm_stories;
CREATE POLICY "ff_stories_auth_write"   ON public.farm_stories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------
-- 6) STORAGE BUCKETS - admin upload buttons upload to these buckets.
--    'products' = product images/videos, 'banner' = banner/story media.
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banner',   'banner',   true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "ff_storage_public_read" ON storage.objects;
CREATE POLICY "ff_storage_public_read" ON storage.objects FOR SELECT
  USING (bucket_id IN ('products', 'banner'));

DROP POLICY IF EXISTS "ff_storage_auth_insert" ON storage.objects;
CREATE POLICY "ff_storage_auth_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('products', 'banner'));

DROP POLICY IF EXISTS "ff_storage_auth_update" ON storage.objects;
CREATE POLICY "ff_storage_auth_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('products', 'banner'));

DROP POLICY IF EXISTS "ff_storage_auth_delete" ON storage.objects;
CREATE POLICY "ff_storage_auth_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('products', 'banner'));

-- ----------------------------------------------------------------
-- 7) Refresh the API schema cache so changes apply immediately.
-- ----------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- Done. Reload the admin pages after running this.
