# Prompt for ERP team — Farmers Factory Customer Feedback System

Copy everything below this line and paste it as your first message to whoever/whatever is working on the ERP codebase (a developer, or an AI assistant with access to that repo).

---

I need to wire the ERP's L1 and CEO dashboards to read customer feedback data that already exists in our shared Supabase database. Do NOT touch anything in the Farmers Factory website codebase — that side is already built and live. This is purely an ERP-side task: read from an existing table and display it. Please don't modify any other ERP code/screens beyond what's needed for this.

## Background

Farmers Factory (famersfactory.com) added a post-delivery customer feedback system. When an order is marked "Delivered" in the website's admin panel, the customer automatically gets an email with a one-time link to a short feedback form (star rating 1-5, delivery tags like "On time"/"Late"/"Damaged", optional comment). Their response is saved to a table called `public.feedback` in the same Supabase project the ERP already connects to.

The proposal (approved) was for this feedback data to also show up on the ERP's L1 and CEO dashboards for reporting — that's the piece that needs building now, on the ERP side.

## The table you need to read: `public.feedback`

Columns:
- `id` (uuid, primary key)
- `order_id` (uuid, references `public.orders.id`, nullable)
- `order_number` (text) — e.g. "FF-891057"
- `customer_name` (text)
- `customer_email` (text)
- `token` (text, unique) — internal use only, not needed for reporting
- `rating` (smallint, 1-5, nullable until submitted)
- `delivery_tags` (text[]) — e.g. `{"On time"}` or `{"Late","Damaged"}`
- `comment` (text, nullable)
- `status` (text) — either `'pending'` (email sent, no response yet) or `'submitted'` (customer responded)
- `created_at` (timestamptz) — when the feedback request was generated
- `submitted_at` (timestamptz, nullable) — when the customer actually submitted

Useful aggregate views for dashboards: response rate (`submitted` count / total count), average rating (avg of `rating` where `status = 'submitted'`), and a "needs attention" flag for `rating <= 2`.

## Row Level Security — how to actually read this table

The table has RLS enabled. There is NO public/anonymous read policy on it (by design, to protect customer PII). Only two ways to read it:

1. **If the ERP connects to Supabase using the service role key** (bypasses RLS entirely) — nothing further needed, you can already query `public.feedback` directly.
2. **If the ERP connects as a specific named Postgres role instead** — someone with database access needs to run this one-time grant (adjust the role name to whatever the ERP actually uses):

```sql
GRANT SELECT ON public.feedback TO your_erp_role_name;
```

Please confirm which of these applies to how the ERP currently connects to Supabase before assuming either path works.

## What to build

A read-only view/widget on the L1 and CEO dashboards showing: total feedback responses, response rate, average rating, and a list/table of individual responses (with the "needs attention" low-rating ones highlighted). Exact layout is up to the ERP's existing dashboard conventions — this is just a new data source, not a new dashboard.

## Important constraints

- Do not modify the `public.feedback` table schema, its RLS policies, or anything in the Farmers Factory website repo — that's already finished and deployed.
- Do not reuse or alter the shared `profiles.role` column for any new access logic here — it has a documented history of being overwritten by ERP processes and breaking the website's admin checks. If you need a role check on the ERP side, use whatever role model the ERP already has (it appeared to have its own `auth_role()`/`get_my_role()` functions and a `profiles_admin_all` policy already, separate from the website's checks).
- This is read-only for the ERP. The ERP should not write to `public.feedback`.

---
