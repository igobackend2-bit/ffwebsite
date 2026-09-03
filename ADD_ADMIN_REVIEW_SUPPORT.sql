-- ================================================================
-- ADD_ADMIN_REVIEW_SUPPORT.sql
--
-- Lets an admin add a review to a product directly from Admin > Reviews,
-- without needing a real customer account behind it (e.g. to seed a new
-- product with its first few reviews, or add feedback a customer gave you
-- outside the website).
--
-- The reviews table on this live database has drifted from what
-- supabase_schema.sql in this repo describes (confirmed directly via
-- information_schema — same kind of drift already found on a couple of
-- other tables in this project, e.g. orders.user_id). The real table
-- requires customer_id UUID NOT NULL (not user_id, and there's no `status`
-- column at all — display uses an `is_visible` boolean instead) because
-- every review was assumed to come from a signed-in customer submitting it
-- themselves. An admin-added review has no real customer account behind
-- it, so it has nothing valid to put in that column — this migration makes
-- customer_id (and user_id, for the same reason) optional (NULL) so those
-- rows can exist. Existing customer-submitted reviews are unaffected; they
-- still have their real customer_id.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

ALTER TABLE public.reviews ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE public.reviews ALTER COLUMN user_id DROP NOT NULL;

-- Refresh API schema cache
NOTIFY pgrst, 'reload schema';

-- Verify: customer_id and user_id should now both show is_nullable = YES
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'reviews'
ORDER BY ordinal_position;
