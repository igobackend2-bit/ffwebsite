-- ================================================================
-- FIX_STREAMS_SAVE.sql
-- Fixes: "Failed to save stream. Please check all fields."
--
-- Cause: the live farm_streams table was originally created with a
-- different structure, and it likely has required (NOT NULL)
-- columns the website code never fills in, so every insert fails.
-- This script relaxes those requirements and makes sure the id
-- column auto-generates.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

-- 1) Make the id column auto-generate (if it is a UUID without default)
DO $$
DECLARE t text; d text;
BEGIN
  SELECT data_type, column_default INTO t, d
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='farm_streams' AND column_name='id';

  IF t = 'uuid' AND d IS NULL THEN
    EXECUTE 'ALTER TABLE public.farm_streams ALTER COLUMN id SET DEFAULT gen_random_uuid()';
  END IF;
END $$;

-- 2) Drop NOT NULL on every required column that has no default
--    (except id) so inserts from the admin panel always succeed.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='farm_streams'
      AND is_nullable='NO' AND column_default IS NULL
      AND column_name <> 'id'
  LOOP
    EXECUTE format('ALTER TABLE public.farm_streams ALTER COLUMN %I DROP NOT NULL', r.column_name);
    RAISE NOTICE 'Relaxed NOT NULL on farm_streams.%', r.column_name;
  END LOOP;
END $$;

-- 3) Refresh API schema cache
NOTIFY pgrst, 'reload schema';

-- 4) Show the stories you added (so we can see why videos don't play)
--    This result appears below after Run - please screenshot it.
SELECT id, farmer, title, image_url, video_url, is_live, display_order
FROM public.farm_stories
ORDER BY display_order;
