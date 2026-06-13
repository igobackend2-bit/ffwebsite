-- ================================================================
-- FIX_WISHLIST_AND_REMOVE_DEMO.sql
-- 1) Creates the missing wishlist table  -> fixes "Failed to add
--    to wishlist" for logged-in customers.
-- 2) Removes the seeded DEMO customer accounts (the "Anonymous"
--    rows with @farmersfactory.in / @farmersfactory.com /
--    @ffactory.com emails) from Customers.
-- 3) Removes ALL current leads (they are test entries).
--    !! If any lead in Admin -> Leads is REAL, delete the test
--    ones one-by-one in the admin page instead, and remove
--    section 3 below before running.
--
-- Your admin account (admin@famersfactory.com) is NOT touched.
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- ================================================================

-- ----------------------------------------------------------------
-- 1) WISHLIST TABLE (fixes the heart button)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ff_wishlist_own_rows" ON public.wishlist;
CREATE POLICY "ff_wishlist_own_rows" ON public.wishlist
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 2) REMOVE DEMO CUSTOMER ACCOUNTS
--    Matches only the seeded demo domains. Note your real domain
--    is famersfactory.com (no second "r") so the admin account
--    can never match, and it is excluded explicitly as well.
-- ----------------------------------------------------------------
DO $$
DECLARE demo_ids uuid[];
BEGIN
  SELECT COALESCE(array_agg(id), '{}') INTO demo_ids
  FROM auth.users
  WHERE (email LIKE '%@farmersfactory.in'
      OR email LIKE '%@farmersfactory.com'
      OR email LIKE '%@ffactory.com')
    AND email <> 'admin@famersfactory.com';

  RAISE NOTICE 'Demo accounts found: %', array_length(demo_ids, 1);

  BEGIN
    DELETE FROM public.wishlist WHERE user_id = ANY(demo_ids);
  EXCEPTION WHEN undefined_table THEN NULL; END;

  BEGIN
    DELETE FROM public.profiles
    WHERE id = ANY(demo_ids)
       OR ((email LIKE '%@farmersfactory.in'
         OR email LIKE '%@farmersfactory.com'
         OR email LIKE '%@ffactory.com')
        AND email <> 'admin@famersfactory.com');
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  BEGIN
    DELETE FROM public.users
    WHERE id = ANY(demo_ids)
       OR ((email LIKE '%@farmersfactory.in'
         OR email LIKE '%@farmersfactory.com'
         OR email LIKE '%@ffactory.com')
        AND email <> 'admin@famersfactory.com');
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

  DELETE FROM auth.identities WHERE user_id = ANY(demo_ids);
  DELETE FROM auth.users      WHERE id      = ANY(demo_ids);
END $$;

-- ----------------------------------------------------------------
-- 3) REMOVE ALL TEST LEADS
--    !! Deletes every row in the leads table. Remove this section
--    if any lead is a real customer enquiry.
-- ----------------------------------------------------------------
DELETE FROM public.leads;

-- ----------------------------------------------------------------
-- 4) Refresh API schema cache + show what is left
-- ----------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

SELECT
  (SELECT count(*) FROM public.profiles)  AS customers_left,
  (SELECT count(*) FROM public.leads)     AS leads_left,
  (SELECT count(*) FROM public.wishlist)  AS wishlist_rows;
