# Farmers Factory — Website Audit & Reference

famersfactory.com — Next.js + Supabase organic produce e-commerce site, deployed on Hostinger.

This file documents a full site audit and the fixes applied, so anyone picking up this project (including a future AI session) has one place to see what's real, what was fake, and what's still open. No application code outside what's listed under "Fixes applied" was touched to produce this document.

## Environment variables required in production (Hostinger)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key, bypasses RLS — used in API routes only |
| `NEXT_PUBLIC_SITE_URL` | `https://famersfactory.com` — used to build absolute links/images in emails |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Gmail SMTP relay for all outgoing email (order + feedback emails) |
| `EMAIL_FROM` | Display name/address emails are sent from |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 (optional, no-op if unset) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` / `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Search Console / Bing Webmaster ownership tags (optional) |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity (optional, no-op if unset) |

See `.env.example` for the full template.

## Known real vs. fake data (audit findings)

The site has, at various points, mixed genuinely live data with hardcoded placeholder values. Status as of this audit:

- **Admin dashboard KPI trend arrows** (Total Revenue, Active Orders, Total Customers) — were hardcoded fake percentages (`+12.5%`, `+5.2%`, `+18.1%`) shown on every load regardless of real performance. **Fixed this session** — removed; the underlying numbers themselves (revenue, order count, customer count, stock alerts) were always real.
- **Conversion Funnel widget** (admin dashboard) — "Browsing" was a fabricated number (`customers × 10`), and "Add to Cart"/"Checkout" were misleading point-in-time snapshots, not real cumulative totals. **Fixed this session** — added a real `analytics_events` table logging actual visits, add-to-cart actions, and checkout starts (see `ADD_ANALYTICS_EVENTS_FUNNEL.sql`). Counts start from zero going forward; no historical backfill exists.
- **`SustainabilityMeter` component** (`src/components/SustainabilityMeter.tsx`, shown on product pages as "Harvest Impact") — carbon saved / water saved / delivery miles figures are entirely made up per category, and the "miles" figure is a random number that changes on every page render. **Not fixed** — flagged here, not touched, since it wasn't part of this session's requested scope. Recommend deciding whether to replace with real figures or remove before relying on it for customer-facing claims.
- **Stock reduction on order placement** — confirmed real and working (`decrement_stock` Postgres function, verified live in production).
- **Stock restoration on cancellation** and **oversell prevention at checkout** — were missing entirely (cancelling an order never gave stock back; two customers could both buy the last few units). **Fixed this session** — see `ADD_STOCK_RESTORE_AND_OVERSELL_PREVENTION.sql`.
- **Leads page vs. Customers page** — confirmed working as designed, but not connected the way it might look: a "lead" row is created only at signup (or Contact form / marketing popup submission), not on every login. The Customers page lists all registered accounts regardless of order history. Marking a lead "Converted" is a fully manual admin action — nothing automatically flips it when that person places an order. Not changed; documented for awareness.
- **Product/email images and logo** — order confirmation emails were showing broken product images because relative image paths (e.g. `/products/x.jpg`) don't resolve inside an email (no page origin to fall back to). **Fixed this session** — image URLs are now made absolute before being used in email HTML.
- **Feedback request email + admin visibility of customer emails** — two separate real bugs, both fixed this session: (1) an `avatar_url` column that no longer exists in `profiles` was silently breaking every admin-side customer lookup; (2) guest/unlinked orders store a non-UUID placeholder (`"phone:+91..."`) in `user_id`, which was breaking the same batched lookup for every order, not just guest ones. See `FIX_ADMIN_PROFILE_EMAIL_ACCESS.sql` and the `getAllOrders()` fix in `src/lib/admin.ts`.
- **Email deliverability (inbox vs. spam)** — emails now send successfully (confirmed via Hostinger runtime logs), but may land in spam. This is a sender-reputation limitation of relaying through a personal Gmail account via SMTP, not a code bug — a real fix requires a custom domain + transactional email provider (Resend/SES) with SPF/DKIM/DMARC, which hasn't been implemented (declined in favor of zero-code-change SMTP). A plain-text email part and a Reply-To header were added as a minor, real improvement.

## Customer Feedback System

Post-delivery survey, fully built and live:
- `public.feedback` table (`ADD_CUSTOMER_FEEDBACK_SYSTEM.sql`) — RLS-locked to admin only, no public/anon access; the customer-facing form talks only to server API routes using the service role key.
- Automatically triggered when an order is marked Delivered (`src/app/admin/orders/page.tsx`).
- One-time backfill endpoint (`/api/feedback/backfill`, button on `/admin/feedback`) catches up customers whose orders were delivered before this system existed.
- Designed so the separate ERP system (shares the same Supabase project) can read this same table for L1/CEO reporting — see `ERP_TEAM_HANDOFF_FEEDBACK_SYSTEM.md` for the handoff brief, and the grant note at the bottom of `ADD_CUSTOMER_FEEDBACK_SYSTEM.sql`.

## SQL files in this repo

This project follows a convention of standalone `.sql` migration files run manually in the Supabase SQL Editor (no migration framework). There are many at the repo root, reflecting the project's history:

**From this session's audit/fixes** (see descriptions above): `FIX_ADMIN_PROFILE_EMAIL_ACCESS.sql`, `ADD_CUSTOMER_FEEDBACK_SYSTEM.sql`, `ADD_STOCK_RESTORE_AND_OVERSELL_PREVENTION.sql`, `ADD_ANALYTICS_EVENTS_FUNNEL.sql`.

**Core schema / historical setup**: `supabase_schema.sql`, `production_setup.sql`, `phase_2_setup.sql`, `supabase_new_tables_only.sql`, `community_schema.sql`, `live_schema.sql`, `reviews_schema.sql`, `traceability_schema.sql`, `farm_streams.sql`, `banners_setup.sql`, `seed_products.sql`, `decrement_stock.sql`.

**Historical `FIX_*` patches** (each named for the specific issue it solved at the time — admin permissions/RLS, order status constraints, wishlist, notifications, storage uploads, coupons, CRM columns, leads table, live schema, order foreign keys, and others): these are kept for history/reference. Not all are still relevant to the current schema — if reviewing the database from scratch, prefer the current live schema over re-running old fixes blindly.

**`scratch/`** — working/scratch SQL files from earlier debugging sessions, not part of the official migration set.

## Deployment

Hosted on Hostinger as a Node.js app, deployed from this GitHub repo. Environment variables are configured directly in Hostinger's panel (not read from any committed `.env` file — `.env*` is gitignored except `.env.example`). After any env var change, the app needs a restart (not necessarily a full redeploy) to pick up the new value.
