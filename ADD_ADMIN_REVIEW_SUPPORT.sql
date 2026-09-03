-- ================================================================
-- ADD_ADMIN_REVIEW_SUPPORT.sql
--
-- Lets an admin add a review to a product directly from Admin > Reviews,
-- without needing a real customer account behind it (e.g. to seed a new
-- product with its first few reviews, or add feedback a customer gave you
-- outside the website).
--
-- The reviews table (see supabase_schema.sql) requires
--   user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL
-- because every review was assumed to come from a signed-in customer
-- submitting it themselves. An admin-added review has no real customer
-- account behind it, so it has nothing valid to put in that column — this
-- migration makes user_id optional (NULL) so those rows can exist. Existing
-- customer-submitted reviews are unaffected; they still have their real
-- user_id.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

ALTER TABLE public.reviews ALTER COLUMN user_id DROP NOT NULL;

-- Refresh API schema cache
NOTIFY pgrst, 'reload schema';

-- Verify: user_id should now show is_nullable = YES
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'reviews'
ORDER BY ordinal_position;
