-- ================================================================
-- FIX_WISHLIST.sql
-- Fixes: "Failed to add to wishlist" for logged-in customers.
-- Cause: the wishlist table does not exist in this Supabase project
-- (it lived in the old project and was never migrated).
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.wishlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- Customers can only see and manage their OWN wishlist rows.
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ff_wishlist_own_rows" ON public.wishlist;
CREATE POLICY "ff_wishlist_own_rows" ON public.wishlist
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Refresh API schema cache
NOTIFY pgrst, 'reload schema';

-- Done. Reload the website and tap the heart icon on any product.
