-- ================================================================
-- ADD_ANALYTICS_EVENTS_FUNNEL.sql
--
-- Backs the admin dashboard's "Conversion Funnel" widget with real,
-- cumulative data instead of a made-up "Browsing" number and
-- point-in-time-only snapshots for the other steps.
--
-- public.analytics_events logs three lightweight event types:
--   'visit'          — one per browser session (see VisitTracker component)
--   'add_to_cart'     — fired every time addToCart() succeeds
--   'checkout_start'  — fired once when the /checkout page is opened
--
-- "Paid" continues to come from the real orders table directly — no
-- event needed for that, it's already a hard fact.
--
-- RLS: any visitor (including anonymous/guest, not logged in) can INSERT
-- an event — this has to be public since visits/add-to-cart happen before
-- login. Nobody except admin can SELECT/read the raw event rows, so no
-- visitor can see anyone else's activity. Uses the same public.ff_is_admin()
-- already relied on elsewhere in this schema.
--
-- Safe to run multiple times.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('visit', 'add_to_cart', 'checkout_start')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS analytics_events_public_insert ON public.analytics_events;
CREATE POLICY analytics_events_public_insert ON public.analytics_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS analytics_events_admin_select ON public.analytics_events;
CREATE POLICY analytics_events_admin_select ON public.analytics_events
  FOR SELECT USING (public.ff_is_admin());

NOTIFY pgrst, 'reload schema';

-- Verify
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'analytics_events';
