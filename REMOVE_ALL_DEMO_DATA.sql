-- ================================================================
-- REMOVE_ALL_DEMO_DATA.sql
-- Wipes everything currently in Admin -> Customers, Admin -> CRM
-- Leads, and Admin -> Orders (test/demo data from development).
--
-- KEPT, NOT TOUCHED: your admin account, products, banners,
-- coupons, farmers, farm stories/streams.
--
-- Your admin login is identified by profiles.role = 'admin' (not
-- by email), so this works regardless of which email you used to
-- sign in as admin.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- THIS IS PERMANENT. There is no undo once you click Run.
-- ================================================================

DO $$
DECLARE customer_ids uuid[];
BEGIN
  -- Every signed-up user EXCEPT the admin account
  SELECT COALESCE(array_agg(id), '{}') INTO customer_ids
  FROM public.profiles
  WHERE role IS DISTINCT FROM 'admin';

  RAISE NOTICE 'Customer accounts to remove: %', array_length(customer_ids, 1);

  -- Tables that are NOT guaranteed to cascade from auth.users in
  -- every historical schema version of this project. Each is
  -- wrapped so a missing table never stops the script.
  BEGIN
    DELETE FROM public.addresses WHERE user_id = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.wishlist WHERE user_id = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.cart WHERE user_id = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.notifications WHERE user_id = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.reviews WHERE user_id = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  -- order_items reference orders, so clear them first
  BEGIN
    DELETE FROM public.order_items
    WHERE order_id IN (SELECT id FROM public.orders WHERE user_id = ANY(customer_ids));
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.orders WHERE user_id = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.profiles WHERE id = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  -- Removing the auth user is the source of truth deletion; any
  -- table that DOES correctly cascade from auth.users (most do, per
  -- this project's schema) is cleaned up automatically here too.
  DELETE FROM auth.identities WHERE user_id = ANY(customer_ids);
  DELETE FROM auth.users      WHERE id      = ANY(customer_ids);
END $$;

-- CRM Leads has no login/account attached to it at all (it just
-- logs signups + popup/contact-form submissions), so every row in
-- it is test data -> wipe it completely.
DELETE FROM public.leads;

-- Refresh API schema cache
NOTIFY pgrst, 'reload schema';

-- Confirm the result
SELECT
  (SELECT count(*) FROM public.profiles) AS customers_left,
  (SELECT count(*) FROM public.orders)    AS orders_left,
  (SELECT count(*) FROM public.leads)     AS leads_left;
