-- ================================================================
-- FIX_WISHLIST_AND_LEADS.sql  (replaces the failed script)
-- 1) Creates the missing wishlist table -> fixes "Failed to add
--    to wishlist".
-- 2) Deletes all test leads.
--
-- NOTE: the "Anonymous" customers are NOT deleted - they are your
-- ERP staff accounts sharing this database (one is referenced by
-- vendor payments). They will be HIDDEN from the website's
-- Customers page by a code update instead.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- ================================================================

-- 1) WISHLIST TABLE (fixes the heart button)
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

-- 2) REMOVE ALL TEST LEADS
--    !! Deletes every row in the leads table. If any lead is a
--    real customer enquiry, remove this line and delete the test
--    ones one-by-one in Admin -> Leads instead.
DELETE FROM public.leads;

-- 3) Refresh API schema cache + verify
NOTIFY pgrst, 'reload schema';

SELECT
  (SELECT count(*) FROM public.leads)    AS leads_left,
  (SELECT count(*) FROM public.wishlist) AS wishlist_rows;
