-- ================================================================
-- CLEAR_DEMO_NOTIFICATIONS.sql
-- Removes ONLY the junk/test notification rows that were showing in the
-- bell icon dropdown (e.g. title "6%"/"34%"/"78" with message "offer"/"hi").
-- Does NOT touch customers, orders, profiles, or anything else — unlike
-- REMOVE_ALL_DEMO_DATA.sql in this project, which is far more destructive
-- and is NOT what this fixes.
--
-- HOW TO RUN:
-- 1) Run the SELECT below first in Supabase Dashboard -> SQL Editor to
--    preview exactly which rows would be deleted.
-- 2) If the preview looks right, run the DELETE statement underneath it.
-- Safe to run multiple times.
-- ================================================================

-- 1) PREVIEW — run this first, just to see what would be removed
SELECT id, user_id, title, message, created_at
FROM public.notifications
WHERE lower(trim(message)) IN ('offer', 'hi')
   OR title ~ '^[0-9]+%?$';

-- 2) DELETE — only run after confirming the preview above looks correct
DELETE FROM public.notifications
WHERE lower(trim(message)) IN ('offer', 'hi')
   OR title ~ '^[0-9]+%?$';

-- Refresh API schema cache
NOTIFY pgrst, 'reload schema';

-- Confirm how many notifications remain
SELECT count(*) AS notifications_left FROM public.notifications;

-- ================================================================
-- PART 2 — the "+918925958929 / Suguna" row that was still showing to
-- EVERY customer's notification bell.
--
-- WHY IT SHOWED FOR EVERYONE: the bell's query
-- (.or('user_id.is.null,user_id.eq.<current user>')) treats a NULL
-- user_id as "show to all customers" — that's intentional, it's how a
-- real site-wide announcement is meant to work. This one specific row
-- has user_id = NULL but is clearly a leftover test/demo signup entry
-- (a phone number as the title, a first name as the message), not a
-- real announcement, so it was broadcasting to everyone by accident.
-- This does NOT change that broadcast feature -- it only removes this
-- one leftover row (and any other row shaped like it: a bare phone
-- number for a title with no real user tied to it).
-- ================================================================

-- PREVIEW
SELECT id, user_id, title, message, created_at
FROM public.notifications
WHERE user_id IS NULL
  AND title ~ '^\+?[0-9]{10,15}$';

-- DELETE — only run after confirming the preview above looks correct
DELETE FROM public.notifications
WHERE user_id IS NULL
  AND title ~ '^\+?[0-9]{10,15}$';

NOTIFY pgrst, 'reload schema';

SELECT count(*) AS notifications_left FROM public.notifications;
