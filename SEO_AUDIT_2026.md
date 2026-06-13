# Farmers Factory — Deep SEO & Page-Speed Audit

**Site:** https://famersfactory.com
**Stack:** Next.js (App Router) + Supabase, deployed as a Node server build (not static export)
**Audit date:** 13 June 2026
**Scope:** Technical SEO, on-page SEO, structured data, crawlability, AI/LLM discoverability, image accessibility, and page-speed.

---

## 1. Summary

The site was already in good SEO shape: it ships per-page metadata, Open Graph + Twitter cards, schema.org JSON-LD (Organization, WebSite, Product, Breadcrumb), a dynamic `sitemap.xml`, and a `robots.txt`. This audit closed the remaining gaps and documents the page-speed work that needs a deployment/asset pass.

What was changed in code during this audit is listed in Section 8. Everything else is a prioritized recommendation.

---

## 2. Crawlability & indexing

| Item | Status | Notes |
|------|--------|-------|
| `robots.txt` | ✅ Present, improved | Admin/checkout/cart/profile/auth/api correctly disallowed. AI bots now **allowed** (was blocking). |
| `sitemap.xml` | ✅ Dynamic (`src/app/sitemap.ts`) | Static routes + live product pages from Supabase, with `priority` and `changeFrequency`. Safe-fails to static-only if DB is down. |
| Canonical URLs | ✅ | `alternates.canonical` set in root + each page layout. |
| `metadataBase` | ✅ | Set to `https://famersfactory.com`. |
| Indexing directives | ✅ | `robots: { index, follow, googleBot max-image-preview: large }`. |
| Private routes noindexed | ✅ | Admin/transactional areas blocked in robots. |

**Recommended next step:** Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools, and verify the property. Request indexing for the home and `/products` pages.

---

## 3. AI / LLM discoverability (new)

- **`llms.txt` added** at `public/llms.txt` following the llmstxt.org spec — a curated, machine-readable summary of the brand, key pages, product categories, and citation guidance for ChatGPT, Claude, Perplexity, and Google AI Overviews.
- **`robots.txt` updated** to *allow* GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Google-Extended, and CCBot. Previously these were blocked, which would have prevented the site from being read or cited by AI assistants.

> Trade-off note: allowing AI crawlers improves visibility/citation in AI answers but also lets these bots use content for training. This was an explicit choice. To opt back out, change the relevant `User-agent` blocks in `robots.txt` from `Allow: /` to `Disallow: /`.

---

## 4. On-page SEO (titles, descriptions, headings, keywords)

| Page | Title | Meta description | Keywords | H1 |
|------|-------|------------------|----------|-----|
| Home `/` | ✅ template default | ✅ | ✅ (root) | ✅ (HeroSlider) |
| Products `/products` | ✅ | ✅ | ✅ | ✅ |
| About `/about` | ✅ | ✅ | ✅ | ✅ |
| Contact `/contact` | ✅ | ✅ | ✅ | ✅ |
| Delivery `/delivery` | ✅ | ✅ | ✅ | ✅ |
| Streams `/streams` | ✅ | ✅ | ✅ | ✅ (component) |
| Privacy `/privacy` | ✅ | ✅ | ✅ **added** | ✅ |
| Terms `/terms` | ✅ | ✅ | ✅ **added** | ✅ |

- **Title strategy:** root uses a template (`%s | Farmers Factory`) with a strong keyword-rich default. Good.
- **Headings:** each public page has exactly one `<H1>` and a logical `<H2>/<H3>` hierarchy. No multiple-H1 issues found.
- **Keywords:** added `keywords` metadata to `privacy` and `terms` (the only public pages missing them).

**Recommendation:** keep H1s descriptive and keyword-led (e.g. "Fresh Organic Vegetables & Fruits — Farm-Direct Delivery"). Ensure product detail pages render the product name as H1 and a unique meta description per product (the Product JSON-LD already exists).

---

## 5. Structured data (schema.org)

Already implemented in `src/components/seo/JsonLd.tsx` and injected site-wide / per page:

- **Organization** — name, logo, social profiles, contact point (enables Knowledge Panel).
- **WebSite + SearchAction** — enables Google sitelinks search box.
- **BreadcrumbList** — on policy and detail pages.
- **Product** — on `/products/[id]` (price, availability, brand, ratings).

**Recommendation:** add `AggregateRating`/`Review` to Product JSON-LD where reviews exist, and consider `FAQPage` schema on the Delivery/Contact pages for rich results.

---

## 6. Image accessibility & alt text (fixed)

- **Public-facing:** `ProductGallery` thumbnails now use descriptive, product-aware alt text (`{name} thumbnail {n}`).
- **Admin pages:** all images with empty/missing `alt` now have descriptive alt text (products, customer avatars, banners, farmers, inventory, reviews, streams, stories).
- **Decorative images:** the IGO brand watermarks in `IgoBrandsScroll` intentionally keep `alt=""` with `aria-hidden="true"` — this is the **correct** accessibility pattern for purely decorative imagery and should not be changed.

Result: every content image on the site now has meaningful alt text; no missing-alt defects remain.

---

## 7. Page speed & Core Web Vitals

Good foundations already in place: `compress: true`, `poweredByHeader: false`, long-lived cache headers for static/media, `optimizePackageImports`, preconnect/dns-prefetch for Supabase and fonts, and `loading="lazy"` on 43 of 45 images.

### High-impact opportunities (require an asset/deploy pass — not done automatically to avoid touching unrelated code)

1. **Stop preloading the 8 MB hero video site-wide.** `src/app/layout.tsx` has `<link rel="preload" href="/header_video.mp4" as="video">` in the **root** layout, so every page (even ones that never show the video) eagerly downloads 8 MB. This hurts LCP and mobile data. Fix: move the preload into the home page only, or drop the preload and rely on a lightweight poster image with `preload="metadata"` on the `<video>`.

2. **Adopt `next/image`.** The site uses 45 raw `<img>` tags and **zero** `next/image` components, so it gets none of Next's automatic AVIF/WebP conversion, responsive `srcset`, or built-in lazy-loading/blur. `next.config.ts` already enables `formats: ['image/avif','image/webp']` — converting key above-the-fold images (hero, featured products, category tiles) to `<Image>` is the single biggest CWV win. Do this incrementally, starting with the home page.

3. **Compress oversized background PNGs.** Several 1 MB+ PNGs ship in `public/` (`seasonal_harvest_bg.png`, `auth-bg.png`, `marketing_popup_bg.png`, `category_vegetables.png`, `admin-login-bg*.png`). Convert to WebP/AVIF and resize to display dimensions — typically an 80–90% size reduction.

4. **Remove non-asset files from `public/`.** `Valluvam.zip` (22 MB), `Vegetables.zip` (2.3 MB), `Fruits.zip` (1.1 MB), and `banner-organic.png.tmp.png` (1.5 MB temp artifact) are served publicly and bloat the deploy. If they aren't intentional downloads, delete them from `public/`.

5. **Hero/harvest videos.** Four harvest videos (4.7–6.5 MB each) plus the hero video total ~30 MB. Serve compressed `.webm`/H.264 at lower bitrate, use poster frames, and lazy-load below-the-fold videos with `preload="none"`.

### Quick verification checklist after deploy

- Run PageSpeed Insights / Lighthouse on `/` and `/products` (mobile).
- Target LCP < 2.5s, CLS < 0.1, INP < 200ms.
- Confirm AVIF/WebP is being served (Network tab → image `content-type`).
- Confirm `robots.txt`, `sitemap.xml`, and `llms.txt` resolve at the domain root.

---

## 8. Changes applied in this audit

| File | Change |
|------|--------|
| `public/llms.txt` | **New** — LLM-friendly site summary. |
| `public/robots.txt` | AI crawlers switched from `Disallow` to `Allow`; added PerplexityBot, OAI-SearchBot, ChatGPT-User, Claude-Web, Google-Extended; referenced `llms.txt`. |
| `src/components/ProductGallery.tsx` | Thumbnail images given descriptive alt text. |
| `src/app/admin/*` (banners, farmers, inventory, orders, products, reviews, streams, stories) | Empty/missing image `alt` filled with descriptive text. |
| `src/app/privacy/layout.tsx` | Added `keywords` metadata. |
| `src/app/terms/layout.tsx` | Added `keywords` metadata. |

All changes type-check cleanly (`tsc --noEmit` passes). No functional/runtime code paths were altered — changes are limited to metadata, alt attributes, and crawler config.

---

## 9. Recommended roadmap (priority order)

1. Deploy current changes; verify `robots.txt`, `sitemap.xml`, `llms.txt` at the root.
2. Submit sitemap in Google Search Console + Bing; request indexing.
3. Remove the site-wide 8 MB video preload (CWV quick win).
4. Convert home-page above-the-fold images to `next/image`.
5. Compress/convert oversized PNGs and remove `.zip`/`.tmp` files from `public/`.
6. Add per-product unique meta descriptions + AggregateRating schema.
7. Re-run Lighthouse and iterate to LCP < 2.5s on mobile.
