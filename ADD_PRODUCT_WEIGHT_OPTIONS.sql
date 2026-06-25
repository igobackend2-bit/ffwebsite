-- ============================================================================
-- Adds admin-configurable weight/quantity options to the products table.
--
-- Run this ONCE in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- It only ADDS columns with safe defaults, so existing products are unaffected
-- until an admin edits them and chooses specific weight options.
--
-- Two modes per product:
--   'fixed' (default) -> customer can only pick from the exact values listed
--                          in weight_options, e.g. [5] (only 5kg) or [5, 10].
--   'range'            -> customer can pick any whole value between
--                          weight_min and weight_max (e.g. 1 to 50).
-- ============================================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS weight_mode TEXT DEFAULT 'fixed' CHECK (weight_mode IN ('fixed', 'range')),
  ADD COLUMN IF NOT EXISTS weight_options JSONB DEFAULT '[1, 2, 5, 10]'::jsonb,
  ADD COLUMN IF NOT EXISTS weight_min NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS weight_max NUMERIC DEFAULT 10,
  ADD COLUMN IF NOT EXISTS weight_step NUMERIC DEFAULT 1;

-- Backfill any existing rows that ended up with NULL instead of the default
-- (only matters if the columns already existed from a partial prior run).
UPDATE products SET weight_mode = 'fixed' WHERE weight_mode IS NULL;
UPDATE products SET weight_options = '[1, 2, 5, 10]'::jsonb WHERE weight_options IS NULL;
UPDATE products SET weight_min = 1 WHERE weight_min IS NULL;
UPDATE products SET weight_max = 10 WHERE weight_max IS NULL;
UPDATE products SET weight_step = 1 WHERE weight_step IS NULL;
