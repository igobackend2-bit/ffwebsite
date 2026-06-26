-- ================================================================
-- CLEAR_ALL_ORDERS.sql
-- Removes every row left in Admin -> Orders (these were placed
-- using the same login REMOVE_ALL_DEMO_DATA.sql protects, which is
-- why they survived that cleanup).
--
-- Only touches order_items and orders. Nothing else (profiles,
-- leads, products, admin login) is changed.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- THIS IS PERMANENT.
-- ================================================================

DELETE FROM public.order_items;
DELETE FROM public.orders;

NOTIFY pgrst, 'reload schema';

SELECT (SELECT count(*) FROM public.orders) AS orders_left;
