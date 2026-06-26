-- ═══════════════════════════════════════════════════════════════
-- FIX: Red notification badge never clears for broadcast/offer
-- notifications (e.g. "5% offer"), even after the customer opens
-- and reads them.
--
-- Root cause: broadcast notifications (sent to all customers, not
-- one specific person) are stored with user_id = NULL. The app's
-- "mark as read" code correctly tries to update is_read = true on
-- these rows, but the database's Row Level Security policy for
-- UPDATE only ever allowed a customer to update a row where
-- user_id = their own id. A row with user_id = NULL never matches
-- that check, so the update was silently rejected every time, and
-- the unread badge stayed stuck on red no matter how many times
-- it was opened.
--
-- Fix: allow the update when the row is either the customer's own
-- OR a broadcast (user_id IS NULL) — matching the same rule already
-- used for SELECT (customers can already see broadcast rows, they
-- just couldn't mark them read).
-- ═══════════════════════════════════════════════════════════════

-- Remove any older/conflicting versions of this policy by name
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own_or_broadcast" ON public.notifications;

CREATE POLICY "notifications_update_own_or_broadcast"
  ON public.notifications FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id)
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Done! Re-open the notification bell on the website — the red
-- count should now clear correctly, including for broadcast offers.
