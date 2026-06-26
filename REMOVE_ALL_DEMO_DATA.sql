-- ================================================================
-- REMOVE_ALL_DEMO_DATA.sql  (v3 — fixes "operator does not exist:
-- text = uuid")
--
-- WHY v2 FAILED:
-- Your `orders.user_id` column (and possibly others) is stored as
-- TEXT in the live database, not UUID -- this project has mixed the
-- two types across different schema files over time. v2 compared a
-- UUID array directly against that column, which Postgres rejects
-- outright with "operator does not exist: text = uuid", and the
-- whole script stopped right there before deleting anything.
--
-- THE FIX: every comparison below casts both sides to ::text first,
-- so it works whether a given column is UUID or TEXT.
--
-- KEPT, NOT TOUCHED: your admin account, products, banners,
-- coupons, farmers, farm stories/streams.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- THIS IS PERMANENT. There is no undo once you click Run.
-- ================================================================

DO $$
DECLARE customer_ids text[];
BEGIN
  -- Every signed-up user EXCEPT the admin account (identified by
  -- profiles.role = 'admin', not by email)
  SELECT COALESCE(array_agg(id::text), '{}') INTO customer_ids
  FROM public.profiles
  WHERE role IS DISTINCT FROM 'admin';

  RAISE NOTICE 'Customer accounts to remove: %', array_length(customer_ids, 1);

  -- order_items reference orders, so clear them first
  BEGIN
    DELETE FROM public.order_items
    WHERE order_id::text IN (
      SELECT id::text FROM public.orders WHERE user_id::text = ANY(customer_ids)
    );
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.orders WHERE user_id::text = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.addresses WHERE user_id::text = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.wishlist WHERE user_id::text = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.cart WHERE user_id::text = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.notifications WHERE user_id::text = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.reviews WHERE user_id::text = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  -- Finally, the profile rows themselves (this is what Admin ->
  -- Customers reads)
  BEGIN
    DELETE FROM public.profiles WHERE id::text = ANY(customer_ids);
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  RAISE NOTICE 'Done removing customer-linked rows.';
END $$;

-- CRM Leads has no login/account attached to it (it just logs
-- signups + popup/contact-form submissions) -- wipe every row.
DELETE FROM public.leads;

-- Optional, best-effort: also try to remove the actual login (auth)
-- record for each test account, one at a time, so a problem with
-- ONE account can never block the others (or anything above).
DO $$
DECLARE uid uuid;
BEGIN
  FOR uid IN
    SELECT u.id FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE p.id IS NULL OR p.role IS DISTINCT FROM 'admin'
  LOOP
    BEGIN
      DELETE FROM auth.identities WHERE user_id = uid;
      DELETE FROM auth.users WHERE id = uid;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not remove login for %, left in place (in-use by another table): %', uid, SQLERRM;
    END;
  END LOOP;
END $$;

-- Refresh API schema cache
NOTIFY pgrst, 'reload schema';

-- Confirm the result
SELECT
  (SELECT count(*) FROM public.profiles) AS customers_left,
  (SELECT count(*) FROM public.orders)    AS orders_left,
  (SELECT count(*) FROM public.leads)     AS leads_left;
