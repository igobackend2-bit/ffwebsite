-- ================================================================
-- ADD_CUSTOMER_FEEDBACK_SYSTEM.sql
--
-- Adds the post-delivery Customer Feedback System (per the approved
-- proposal from Gokul R, IT & AI Junior Associate — IGO Agritech Farms).
--
-- What this creates:
--   1. public.feedback table — one row per feedback request/response.
--   2. RLS locked to admin-only direct access, using the SAME
--      public.ff_is_admin() function already relied on elsewhere in
--      this schema (see FIX_ADMIN_PERMISSIONS.sql) — no new admin-role
--      logic invented, reusing what's already proven to survive the
--      ERP occasionally touching shared tables.
--   3. NO public/anon policy on this table at all. The customer-facing
--      feedback form never talks to Supabase directly — it goes through
--      the app's own server API routes (/api/feedback/[token] and
--      /api/feedback/submit), which use the service role key
--      (SUPABASE_SERVICE_ROLE_KEY, already used the same way in
--      src/app/api/send-email/route.ts). This means the anon key can
--      NEVER read another customer's name, email, or comment — the
--      table has zero public surface.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  order_number text,
  customer_name text,
  customer_email text,
  token text UNIQUE NOT NULL,
  rating smallint CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
  delivery_tags text[] DEFAULT '{}',
  comment text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_feedback_token ON public.feedback(token);
CREATE INDEX IF NOT EXISTS idx_feedback_order_id ON public.feedback(order_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feedback_admin_select ON public.feedback;
CREATE POLICY feedback_admin_select ON public.feedback
  FOR SELECT USING (public.ff_is_admin());

DROP POLICY IF EXISTS feedback_admin_insert ON public.feedback;
CREATE POLICY feedback_admin_insert ON public.feedback
  FOR INSERT WITH CHECK (public.ff_is_admin());

-- Refresh API schema cache
NOTIFY pgrst, 'reload schema';

-- ================================================================
-- ERP read access
-- ================================================================
-- Your ERP already shares this Supabase project (see the note at the
-- top of FIX_ADMIN_PERMISSIONS.sql). What it needs to do to show this
-- data on the L1 and CEO dashboards depends on how IT connects here:
--
--   * If the ERP connects using the Supabase SERVICE ROLE key,
--     nothing further is needed — the service role bypasses RLS
--     automatically and can already read this table.
--
--   * If the ERP connects as a specific Postgres role instead,
--     uncomment the line below and replace the role name:
--
-- GRANT SELECT ON public.feedback TO your_erp_role_name;
--
-- Confirm which of these applies with whoever manages the ERP side
-- before relying on it — this file only prepares the table, it does
-- not (and cannot, from this codebase) configure the ERP itself.
-- ================================================================

-- Verify: shows the table now exists with RLS enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'feedback';
