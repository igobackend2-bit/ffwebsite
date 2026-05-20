# Farmers Factory — Push to GitHub + Vercel Deploy + Domain Setup

This guide walks you through the **three things only you can do** (because they need your accounts):

1. Push the new SEO files to `https://github.com/igobackend2-bit/ffwebsite.git`
2. Deploy to Vercel
3. Connect a custom domain (e.g. `farmersfactory.com`)

Run every command in **PowerShell** (or **Git Bash**) from the project root: `D:\Igo-websites\Igo-Farmer Factory`.

---

## Part 1 — Push to your new GitHub repo

### 1.1 First, **close** any open Cursor / VS Code / GitHub Desktop windows for this project
There is a stale lockfile at `.git\index.lock`. Delete it:

```powershell
cd "D:\Igo-websites\Igo-Farmer Factory"
del .git\index.lock 2>$null
```

### 1.2 Confirm git identity (already set, but re-confirm):

```powershell
git config user.email "marketing@igogroups.com"
git config user.name  "igomarket"
```

### 1.3 Re-point your remote to the new repo

Your current `origin` points to the old `igogroups-website/IGO-ff-website.git`. Switch it:

```powershell
git remote set-url origin https://github.com/igobackend2-bit/ffwebsite.git
git remote -v
```

You should see:
```
origin  https://github.com/igobackend2-bit/ffwebsite.git (fetch)
origin  https://github.com/igobackend2-bit/ffwebsite.git (push)
```

> 💡 If you want to KEEP the old remote too, do this instead:
> ```powershell
> git remote add ff https://github.com/igobackend2-bit/ffwebsite.git
> ```
> Then everywhere below replace `origin` with `ff`.

### 1.4 Add ONLY the new SEO files

Your working tree shows ~80 files as "modified" but that's only Windows line-ending re-encoding (same content). **Do not** `git add .` — it pollutes history. Stage just the SEO additions:

```powershell
git add SEO_REPORT.md DEPLOY_GUIDE.md `
        public/robots.txt `
        src/app/robots.ts `
        src/app/sitemap.ts `
        src/app/manifest.ts `
        src/app/about/layout.tsx `
        src/app/auth/layout.tsx `
        src/app/cart/layout.tsx `
        src/app/checkout/layout.tsx `
        src/app/contact/layout.tsx `
        src/app/delivery/layout.tsx `
        src/app/orders/layout.tsx `
        src/app/privacy/layout.tsx `
        src/app/products/layout.tsx `
        "src/app/products/[id]/layout.tsx" `
        src/app/profile/layout.tsx `
        src/app/streams/layout.tsx `
        src/app/terms/layout.tsx `
        src/components/seo/JsonLd.tsx

git status
```

(In Git Bash, replace the backtick line-continuation `` ` `` with backslash `\`.)

### 1.5 Commit

```powershell
git commit -m "feat(seo): full SEO foundation - robots, sitemap, manifest, JSON-LD, per-page metadata + customer keywords"
```

### 1.6 Push to main

```powershell
git push -u origin main
```

> 🔑 If GitHub asks for a password, use a **Personal Access Token**, not your account password.
> Create one at: https://github.com/settings/tokens → "Generate new token (classic)" → tick `repo` → copy.
> Or set up the GitHub CLI once: `winget install --id GitHub.cli` then `gh auth login`.

### 1.7 If the new repo is **empty** (first push), and `main` doesn't exist yet on remote:

```powershell
git push -u origin main
# if it errors with "src refspec main does not match any", first check your branch name:
git branch --show-current
# if it's "master", rename: git branch -M main, then push.
```

### 1.8 If the new repo has different history and rejects your push:

You'll see `non-fast-forward` or `refusing to update`. Choose ONE:

- **Option A — Overwrite the new repo with your current work** (recommended if it's empty/fresh):
  ```powershell
  git push -u origin main --force
  ```
- **Option B — Merge first** (if the remote has commits you need):
  ```powershell
  git pull origin main --allow-unrelated-histories
  # resolve conflicts, then:
  git push -u origin main
  ```

---

## Part 2 — Deploy to Vercel

### 2.1 Sign in / sign up

Go to **https://vercel.com/signup** and click "Continue with GitHub". Authorize using the same GitHub account that owns `igobackend2-bit/ffwebsite`.

### 2.2 Import the repository

1. Click **"Add New…" → "Project"** on the Vercel dashboard.
2. In the "Import Git Repository" list, find `igobackend2-bit/ffwebsite` and click **Import**.
3. If it isn't visible, click "Adjust GitHub App Permissions" and grant Vercel access to the repo.

### 2.3 Configure the project

| Setting | Value |
|---|---|
| Project name | `farmers-factory` (or anything you like) |
| Framework Preset | **Next.js** (auto-detected) |
| Root Directory | `./` (default) |
| Build Command | leave default — Vercel uses `next build` |
| Output Directory | leave default |
| Install Command | leave default — `npm install` |
| Node.js Version | **20.x** (or **22.x**) — set under Project Settings → General |

### 2.4 Add environment variables

Click **"Environment Variables"** before deploy and add **EVERY** value from your `.env.local`:

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://farmersfactory.com` | Used by sitemap, canonical, OG |
| `NEXT_PUBLIC_SUPABASE_URL` | (from `.env.local`) | Required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from `.env.local`) | Required |
| `RESEND_API_KEY` | (your Resend API key) | If using Resend emails |
| `SUPABASE_SERVICE_ROLE_KEY` | (server-only) | If used in API routes |

> Mark each as available to **Production**, **Preview**, and **Development**.

### 2.5 Click **Deploy**

First build takes ~3-6 minutes. When it finishes, you get a free URL like:
`https://farmers-factory-xyz.vercel.app`

Open it. Smoke-test:
- Home loads
- `/products` loads
- `/sitemap.xml` lists product URLs ✅
- `/robots.txt` shows the rules ✅
- `/manifest.webmanifest` returns JSON ✅

### 2.6 Re-deploys are automatic

Every `git push` to `main` triggers a fresh Vercel build.

---

## Part 3 — Buy + connect your custom domain

### 3.1 Decide where to buy

| Registrar | Price (.com) | Notes |
|---|---|---|
| **GoDaddy** | ~₹1,099/yr first year | Familiar UI, India billing |
| **Namecheap** | ~$10/yr | Best price, strong support |
| **Vercel Domains** | $20/yr | **Simplest** — auto-connects, no DNS work needed |
| **Google Domains / Squarespace** | $12/yr | Clean UI |
| **Cloudflare Registrar** | At-cost (~$10) | Cheapest renewal, no markup |

**Recommended:** if you want one-click setup, buy directly from Vercel:
**Project → Settings → Domains → "Buy a Domain"** in the Vercel dashboard.

### 3.2 If you bought elsewhere (e.g., GoDaddy)

1. In Vercel: **Project → Settings → Domains → Add Domain** → type `farmersfactory.com` → click **Add**.
2. Vercel will show you DNS records to set at your registrar. They will be either:

   **Option A (recommended) — Use Vercel nameservers:**
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
   At GoDaddy: **My Products → Domain → DNS → Nameservers → Change → Enter my own** → paste the two above. Save. Done — Vercel handles everything.

   **Option B — Keep your registrar's DNS, point with records:**
   At GoDaddy DNS Management add:
   | Type | Name | Value | TTL |
   |---|---|---|---|
   | `A` | `@` | `76.76.21.21` | 600 |
   | `CNAME` | `www` | `cname.vercel-dns.com` | 600 |

3. Also add `www.farmersfactory.com` in Vercel and choose to **redirect www → root** (or root → www, your call).

4. **SSL** is automatic. Vercel issues a free Let's Encrypt cert within 5-15 min.

### 3.3 Verify

After ~5-30 min:
- Visit `https://farmersfactory.com` — should load
- Visit `https://www.farmersfactory.com` — should redirect
- Padlock icon = SSL working
- Run https://search.google.com/test/rich-results on a product URL — should detect Product schema

---

## Part 4 — Tell Google about the site (so customers actually find it)

After deploy + domain are live:

### 4.1 Google Search Console (free, mandatory)
1. https://search.google.com/search-console
2. **Add property** → Domain → enter `farmersfactory.com`
3. Verify ownership via DNS TXT record (Vercel makes this easy if using its nameservers — auto-verify).
4. Submit sitemap: **Sitemaps → Add new sitemap → `sitemap.xml`** → Submit.

### 4.2 Bing Webmaster Tools (free)
1. https://www.bing.com/webmasters
2. Import from Search Console (1-click) and submit the same sitemap.

### 4.3 Google Business Profile (free, huge for local searches)
1. https://www.google.com/business
2. Add business name `Farmers Factory`, category `Organic farm`, your address & phone.
3. Once verified, your business shows in Google Maps + local pack.

### 4.4 Indexing speed-up
- In Search Console, use **URL Inspection** → request indexing for: `/`, `/products`, `/about`, `/delivery`, and 5-10 top product URLs.
- Expect first crawls in 24-72 hours, full indexing in 1-3 weeks.

---

## Part 5 — Optional but valuable

### Update OG image
You're currently using `/banner-organic.png` for Open Graph. Ideal size: **1200 × 630 px**. If your current banner isn't that ratio, regenerate it — better social previews = more clicks.

### Set NEXT_PUBLIC_SITE_URL
Already covered above. Double-check it's set in Vercel → the sitemap reads from it.

### Add Google Analytics 4
Create a GA4 property at https://analytics.google.com → copy the Measurement ID (`G-XXXXXXX`).
Then either:
- Use Vercel's free **Web Analytics** (Settings → Analytics → Enable), zero code, or
- Add the GA4 script to your root layout when you're ready to do that minor edit.

### Wire up an email-capture / popup tool
You already have a `MarketingPopup` component — make sure it's connected to a real list (Mailchimp, Resend audience, etc.). Email = repeat purchases.

---

## Cheat-sheet — the full git+deploy in one paste

```powershell
# from project root
del .git\index.lock 2>$null

git config user.email "marketing@igogroups.com"
git config user.name  "igomarket"

git remote set-url origin https://github.com/igobackend2-bit/ffwebsite.git

git add SEO_REPORT.md DEPLOY_GUIDE.md public/robots.txt `
        src/app/robots.ts src/app/sitemap.ts src/app/manifest.ts `
        src/app/about/layout.tsx src/app/auth/layout.tsx src/app/cart/layout.tsx `
        src/app/checkout/layout.tsx src/app/contact/layout.tsx src/app/delivery/layout.tsx `
        src/app/orders/layout.tsx src/app/privacy/layout.tsx src/app/products/layout.tsx `
        "src/app/products/[id]/layout.tsx" src/app/profile/layout.tsx `
        src/app/streams/layout.tsx src/app/terms/layout.tsx `
        src/components/seo/JsonLd.tsx

git commit -m "feat(seo): full SEO foundation"
git push -u origin main
```

Then go to vercel.com → New Project → Import `igobackend2-bit/ffwebsite` → Deploy. Done.

---

_If anything fails, screenshot the error and paste it here — I'll diagnose._
