# Farmers Factory — Code Audit
**Date:** 2026-06-25 | **Scope:** Full source review (no files changed)

---

## 🔴 CRITICAL — Admin panel has no real security

Four separate problems combine to make the admin panel and database fully exploitable by anyone who visits the site or finds the repo:

1. **Live Supabase service-role key committed in plaintext, in 10 files**: `create_admin.js`, `check_admin.js`, `diag_tmp.js`, `scratch_check_new_project.js`, `scratch_check_profiles.js`, `scratch_check_tables.js`, `scratch_check_users.js`, `scratch_clear_demo_customers.js`, `scratch_clear_demo_data.js`, `scratch_fix_site_settings.js`. This key bypasses Row Level Security entirely — full read/write/delete on every table for the live project (`qwiumswrbddwmlraktvy.supabase.co`). Anyone with repo access (or a leak/fork/public push) has total database control.

2. **Real admin login credentials hardcoded in client-side JS**: `src/app/admin/login/page.tsx` (lines 33-34) calls `supabase.auth.signInWithPassword({ email: 'admin@famersfactory.com', password: 'AdminPassword123!' })`. This ships inside the public JS bundle. Anyone can open devtools and run that same call from the browser console to obtain a real, authenticated admin session — the password box on screen is decorative.

3. **"Admin password" gate is a publicly-readable plaintext DB value**: `getAdminPassword()` (`src/lib/admin.ts`) fetches `site_settings.admin_password` through the public anon client. The RLS policy on that table (`FIX_ADMIN_PASSWORD.sql`) is `FOR SELECT USING (true)` — world-readable. Anyone can query the Supabase REST endpoint directly with the public anon key and read the live password in plaintext.

4. **Route protection is a forgeable cookie, not a server session**: `src/proxy.ts` only checks whether a cookie `admin_auth=true` exists; `src/app/admin/layout.tsx` mirrors that with `localStorage.getItem('admin_auth')`. Either one can be set by hand in the browser console (`document.cookie="admin_auth=true"`), which alone unlocks the `/admin` UI.

**Net effect:** the admin panel currently has no meaningful access control. Anyone who knows (or guesses) the URL can get in three different ways, and the DB-level key exposure means the password gate barely matters anyway.

---

## 🟠 HIGH — Other security/config issues

- **`src/lib/supabase.ts`** hardcodes a fallback Supabase URL + anon key in source (lines 3-5). This regressed after a prior fix (see `FIX_REPORT.md`, item F4) — looks like it was reintroduced during a DB migration commit. Anon keys are meant to be semi-public, but hardcoding still couples the build to one project and defeats key rotation.
- **`netlify.toml`** hardcodes a *different* Supabase project's anon key (the old `celsdwfmogpejwzbkxad` project) and is inconsistent with the actual deployment target — `next.config.ts` says this app deploys to Hostinger/Vercel via `next start`, not Netlify. This file looks stale and should either be removed or reconciled.
- **`typescript.ignoreBuildErrors: true`** is still set in `next.config.ts`, despite the prior audit (`FIX_REPORT.md`) explicitly recommending it be turned off once the codebase was type-clean (it currently is — `tsc --noEmit` returns 0 errors as of this audit). Leaving this on means future type errors will silently ship to production.

---

## 🟡 MEDIUM — Repo hygiene / maintainability

- **38 ad-hoc files sitting in the repo root**, committed to git: `FIX_*.sql` (20 one-off migration/patch scripts), `scratch_*.js`, `test_*.js`, `check_admin*.js`, `create_admin.js`, `diag_tmp.js`. These are debugging/one-time scripts, several of which carry the exposed service-role key (see Critical #1). They clutter the repo and make it hard to tell which SQL is the actual current schema vs. an old patch.
- **`src/context/TranslationContext.tsx` is 113 KB / one file** holding all i18n strings for every language. A prior audit already found 50 silently-duplicated keys in this file; its size makes that class of bug easy to reintroduce and hard to review in diffs.
- **`src/lib/inventory_data.ts`** is 54 KB of inline data in a TS file — likely better as JSON or moved to the DB.
- Two parallel deployment stories live in the repo at once (Netlify config + Vercel config + Hostinger notes in `next.config.ts` + a `mobile/` Expo app), with no single source of truth for "this is how we actually deploy."
- 9 files still contain leftover `console.log` debug statements.

---

## ✅ What's actually fine

- `tsc --noEmit` → **0 errors**. The codebase is currently type-clean.
- `src/app/api/sync-user/route.ts` and `src/app/api/send-email/route.ts` correctly read the service-role key from `process.env` only — no hardcoding in the two real API routes.
- `.env*` is properly gitignored (only `.env.example` is tracked, and it contains placeholders, not real keys).
- No `TODO`/`FIXME` markers left dangling.
- App Router structure (`src/app/*`) is conventional and reasonably organized: storefront, checkout, admin, and API routes are cleanly separated.

---

## Suggested fix priority (for when you assign tasks)

1. Rotate the Supabase service-role key immediately (it must be treated as compromised) and scrub it from the 10 files listed above — or just delete those one-off scripts.
2. Replace the admin auth model: remove the hardcoded `signInWithPassword` call, stop storing the admin password in a publicly-readable table, and gate `/admin` with a real server-verified session (e.g. Supabase Auth + an RLS-protected `profiles.role === 'admin'` check on every request, not a cookie flag).
3. Remove the hardcoded fallback keys in `src/lib/supabase.ts` and `netlify.toml`; decide on one deployment target and delete the other config.
4. Flip `typescript.ignoreBuildErrors` to `false`.
5. Clean up root-level scratch/test/FIX_*.sql files; archive or delete what's no longer needed.
6. (Optional, lower priority) Split `TranslationContext.tsx` per-language or per-namespace; move `inventory_data.ts` to JSON/DB.

No code was changed during this audit. Let me know which of these you want tackled first.
