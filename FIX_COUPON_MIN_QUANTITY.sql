-- ================================================================
-- FIX_COUPON_MIN_QUANTITY.sql
-- Adds a "min_quantity" rule to coupons. A coupon now applies only
-- when the cart meets BOTH the existing Min Spend AND this minimum
-- total quantity (items / kg). Leave it 0/blank for no quantity rule.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT 0;

NOTIFY pgrst, 'reload schema';

-- Verify
SELECT column_name, data_type, column_default
FROM   information_schema.columns
WHERE  table_schema = 'public' AND table_name = 'coupons' AND column_name = 'min_quantity';
