# Farmers Factory

famersfactory.com — organic farm produce e-commerce platform (fruits, vegetables, and traditional farm products) with online ordering, customer accounts, and admin operations, based in Chennai, India. Full stack website + admin dashboard, backed by Supabase.

## Tech Stack

- Framework: Next.js 16 (App Router, TypeScript)
- Styling: Tailwind CSS
- Database & Auth: Supabase (PostgreSQL + Row Level Security)
- Email: Nodemailer (SMTP)
- Animation: Framer Motion
- Icons: Lucide React

## Features

- Product catalog with categories, custom weight/quantity pricing, and stock tracking
- Customer accounts (signup/login), cart, checkout (COD + card), and order tracking with live status updates
- Automatic stock deduction on order placement, with oversell protection and automatic stock restoration on order cancellation
- Post-delivery Customer Feedback System — automatic survey email after delivery, no-login public feedback form, admin dashboard, and read access for the company's separate ERP system (L1/CEO reporting)
- Admin dashboard: orders, products, customers, leads/inquiries, inventory, coupons, farmers, reviews, banners, live streams, farm stories, and site settings
- Real, cumulative conversion funnel tracking (site visits → add to cart → checkout → paid)
- Transactional email notifications for every order status change plus the feedback survey
- SEO / AEO / GEO: structured data (JSON-LD), sitemap, robots.txt, llms.txt, Open Graph/Twitter cards, optional GA4 / Search Console / Bing / Clarity integration

## Project Structure

```
src/
├── app/                  # Routes (Next.js App Router)
│   ├── admin/            # Admin dashboard (orders, products, customers, leads,
│   │                     #   inventory, feedback, coupons, farmers, reviews,
│   │                     #   banners, streams, stories, settings)
│   ├── api/               # Server routes (email sending, feedback, admin, sync-user)
│   ├── auth/              # Login / signup
│   ├── cart/, checkout/   # Cart & checkout flow
│   ├── feedback/[token]/  # Public, no-login post-delivery feedback form
│   ├── orders/            # Customer order tracking
│   ├── products/          # Product catalog & detail pages
│   ├── profile/           # Customer account settings
│   └── (about, contact, delivery, privacy, terms, streams)
├── components/            # 50+ shared UI components
├── context/               # React context providers (Auth, Cart, Wishlist, Loyalty, Translation)
└── lib/                   # Supabase client, admin data functions, email, pricing, feedback, storage
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (see Environment Variables below)

### 1. Install dependencies

```bash
npm install
```

### 2. Copy `.env.example` to `.env.local` and fill in your own credentials

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key — bypasses RLS, used in API routes only |
| `NEXT_PUBLIC_SITE_URL` | Full site URL, e.g. `https://famersfactory.com` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Outgoing email (Gmail SMTP relay) |
| `EMAIL_FROM` | Sender name/address shown on outgoing emails |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 (optional) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` / `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Search engine ownership verification (optional) |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity (optional) |

### 3. Set up the database

Run the SQL files at the repo root in the Supabase SQL Editor. Core schema first (`supabase_schema.sql`, `production_setup.sql`), then feature-specific files as needed (`ADD_CUSTOMER_FEEDBACK_SYSTEM.sql`, `ADD_STOCK_RESTORE_AND_OVERSELL_PREVENTION.sql`, `ADD_ANALYTICS_EVENTS_FUNNEL.sql`, etc.) — each file has a comment at the top explaining what it does. `FIX_*.sql` files are historical patches kept for reference.

### 4. Run the dev server

```bash
npm run dev
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run the dev server locally |
| `npm run build` | Build the production bundle |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |

## Architecture Notes & Gotchas

A few things that aren't obvious from the code alone, worth knowing before making changes:

- **This Supabase project is shared with a separate ERP system.** The ERP connects to the same database for L1/CEO reporting (see the Customer Feedback System). It has, in the past, overwritten the `profiles.role` column, which broke admin permission checks that depended on it. Any new admin-only RLS policy should use `public.ff_is_admin()` (checks the admin account's email OR role — resilient to this), not the older `public.is_admin()` (role-only, fragile). There is also a third, separate admin-check mechanism (`auth_role()` / `get_my_role()` with a `profiles_admin_all` policy covering roles like `admin`/`ceo`/`hr`) that appears to belong to the ERP side — don't assume any one of these three is the only one in effect on a given table; check `pg_policies` for the actual table before changing access rules.
- **Admin login is a single shared account**, not per-staff-member accounts: it authenticates via Supabase Auth as a hardcoded email (`admin@famersfactory.com`) with a password stored in the `site_settings` table (see `getAdminPassword()` in `src/lib/admin.ts`), plus a `localStorage`/cookie flag for the UI gate. There's no per-admin audit trail as a result.
- **Two separate business email addresses are in play**: the outgoing SMTP account (whatever `SMTP_USER`/`EMAIL_FROM` are set to) is what customers see as the "From" address, while `info.thefarmersfactory@gmail.com` is hardcoded in several places (Contact page, Profile page, admin Settings, feedback form error state) as the displayed support contact. These aren't automatically kept in sync — if either changes, check both.
- **Signup logic exists in two separate places** (`src/app/auth/page.tsx` and `src/components/AuthModal.tsx`), each independently inserting into the `leads` table on signup. Worth consolidating if it's ever changed, so both stay in sync.
- **`decrement_stock()` and `restore_stock()`** (Postgres functions) use `SELECT ... FOR UPDATE` row locking specifically so concurrent checkouts can't oversell the same product — don't remove that locking if touching these functions.

## Project Status & Known Limitations

This is a live, actively maintained platform. Recent fixes: admin visibility into customer emails (was silently broken by a stale column reference and non-standard guest order IDs), stock oversell prevention, automatic stock restoration on cancellation, product images in emails, and real (previously fabricated) analytics on the admin dashboard.

Open items worth knowing about:
- **Email deliverability**: outgoing mail sends successfully but may land in spam, since it relays through a personal Gmail account rather than a verified custom domain with SPF/DKIM/DMARC. Fixing this properly requires moving to a transactional email provider (e.g. Resend — already an installed dependency, not yet wired up) with a verified domain.
- **`SustainabilityMeter` component** (shown on product pages as "Harvest Impact"): the carbon/water/mileage figures are placeholder values, not measured data — one of them is randomized on every page load. Needs real figures or removal before relying on it for customer-facing claims.
- **Leads vs. Customers**: a lead is only created at signup (or via the Contact form/marketing popup), not on every login, and does not automatically get marked "Converted" when that person places an order — that's a manual admin action today.

## Deployment

Hosted on Hostinger as a Node.js app, deployed from this GitHub repo. Environment variables are set directly in Hostinger's panel, not read from any committed `.env` file (`.env*` is gitignored except `.env.example`). After changing an environment variable, restart the app in Hostinger's panel to pick up the new value — a full redeploy isn't required just for that.
