-- ============================================================================
-- Adds two admin-configurable columns to the products table so the new
-- /products sort ("Best Discount") and dietary filters (Organic / Vegan /
-- Gluten-Free) on the website have real data to work against.
--
-- Run this ONCE in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- It only ADDS columns with safe defaults, so existing products and every
-- existing query against `products` are unaffected until an admin sets
-- values on a specific product.
--
--   dietary_tags   -> text array, e.g. '{"Organic","Vegan"}'. Empty by
--                     default, so the new dietary filters simply won't
--                     match anything until tags are added — they never
--                     hide products that haven't been tagged yet unless a
--                     filter is actively selected.
--   original_price -> optional "was" price (MRP) used only to compute the
--                     discount % for the "Best Discount" sort. Leave NULL
--                     (the default) for a product with no discount; the
--                     website treats NULL/0 as 0% discount, never an error.
-- ============================================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS dietary_tags TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);

-- Backfill any existing rows that ended up with NULL instead of the default
-- (only matters if the column already existed from a partial prior run).
UPDATE products SET dietary_tags = '{}'::text[] WHERE dietary_tags IS NULL;
