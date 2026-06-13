-- ================================================================
-- FIX_FEATURED_PRODUCTS.sql
-- Ensures the products table has an "is_featured" flag, used by the
-- admin "Add to Freshly Harvested" toggle and the homepage section.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Optional: index to keep the homepage "featured first" ordering fast
CREATE INDEX IF NOT EXISTS idx_products_is_featured
  ON public.products (is_featured);

NOTIFY pgrst, 'reload schema';

-- Verify
SELECT column_name, data_type, column_default
FROM   information_schema.columns
WHERE  table_schema = 'public' AND table_name = 'products' AND column_name = 'is_featured';
