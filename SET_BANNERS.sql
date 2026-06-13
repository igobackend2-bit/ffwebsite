-- ================================================================
-- SET_BANNERS.sql
-- Points the Valluvam and Fruits banners at the images in your
-- website's public/banners folder (valluvam_3d.png, fruits_3d.png).
-- Creates the banners if they don't exist, updates them if they do.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

-- Valluvam banner
UPDATE public.banners
SET media_url = '/banners/valluvam_3d.png', media_type = 'image', is_active = true
WHERE title ILIKE '%valluvam%';

INSERT INTO public.banners (title, subtitle, media_url, media_type, is_active, display_order)
SELECT 'Valluvam Products', 'Traditional purity, delivered fresh', '/banners/valluvam_3d.png', 'image', true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.banners WHERE title ILIKE '%valluvam%');

-- Fruits banner
UPDATE public.banners
SET media_url = '/banners/fruits_3d.png', media_type = 'image', is_active = true
WHERE title ILIKE '%fruit%';

INSERT INTO public.banners (title, subtitle, media_url, media_type, is_active, display_order)
SELECT 'Fresh Fruits', 'Hand-picked from our organic farms', '/banners/fruits_3d.png', 'image', true, 3
WHERE NOT EXISTS (SELECT 1 FROM public.banners WHERE title ILIKE '%fruit%');

-- Show the result
SELECT id, title, media_url, media_type, is_active, display_order
FROM public.banners ORDER BY display_order;
