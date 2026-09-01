-- ================================================================
-- FIX_REVIEW_MODERATION.sql
-- Adds a moderation workflow to product reviews:
--   - New reviews submitted by customers start as 'pending'.
--   - Admin can Approve (shows on the live site) or Reject (never shows
--     publicly) from Admin > Reviews. Admin can also manually re-mark a
--     review's status at any time.
--   - Existing reviews (already live before this fix) are marked
--     'approved' so nothing currently on the site disappears.
--
-- Only touches the `reviews` table. Safe to run multiple times.
-- ================================================================

-- 1) Add the status column (existing rows default to 'approved' so
--    reviews already live on the site keep showing).
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved'
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2) Belt-and-suspenders: make sure any pre-existing rows are explicitly
--    'approved' (in case the column already existed with a different default).
UPDATE public.reviews
SET status = 'approved'
WHERE status IS NULL;

-- 3) Replace the public SELECT policy so only approved reviews are visible
--    to everyone, while a customer can still see their own review (any
--    status) so they get feedback on their own pending/rejected submission.
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

-- 4) Allow admin (service-role key, used by /api/admin/reviews) to update
--    status. Service-role bypasses RLS entirely, so no policy change is
--    required for that — this is just documentation of why PATCH works
--    without a dedicated UPDATE policy for normal users.

-- Refresh API schema cache
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT id, status, is_verified, created_at FROM public.reviews ORDER BY created_at DESC LIMIT 20;
