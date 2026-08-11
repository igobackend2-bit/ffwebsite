import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { categoryHref, productHref } from '@/lib/categorySlug';

export const dynamic = 'force-static';

/**
 * Dynamic sitemap for Farmers Factory.
 * Combines:
 *   1. Static public canonical routes (no query-string URLs — those conflict
 *      with the /products canonical and send mixed signals to Google).
 *   2. Category pages (/vegetables, /fruits, /valluvam-products, ...).
 *   3. Dynamic product detail pages pulled from Supabase, at their real
 *      nested URL (/vegetables/tomato) — the old /products/<id> URLs now
 *      redirect there, so only the canonical nested URL is listed.
 *
 * Safe-fails: if Supabase is unreachable at build time, only static routes
 * are returned so the build never breaks.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/delivery`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/streams`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, updated_at, created_at')
      .eq('is_active', true)
      .limit(5000);

    if (!error && data) {
      // Farmers Factory only sells Fruits and Vegetables now — every other
      // category (Spices, Millets, Oils, Dry Fruits & Seeds, Honey &
      // Jaggery, Valluvam Products, ...) now redirects off this site to
      // https://www.valluvamproducts.com/ (see src/app/[category]/page.tsx
      // and next.config.ts), so exclude them here too rather than pointing
      // Google at URLs that just redirect away.
      const nonValluvam = data.filter((p) =>
        ['fruits', 'vegetables'].includes((p.category || '').toLowerCase().trim())
      );

      const categories = Array.from(new Set(nonValluvam.map((p) => p.category).filter(Boolean)));
      categoryRoutes = categories.map((category) => ({
        url: `${SITE_URL}${categoryHref(category)}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      productRoutes = nonValluvam.map((p: any) => ({
        url: `${SITE_URL}${productHref(p.category, p.name)}`,
        lastModified: p.updated_at
          ? new Date(p.updated_at)
          : p.created_at
          ? new Date(p.created_at)
          : now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (_err) {
    // Silently fall back to static-only sitemap at build time.
    categoryRoutes = [];
    productRoutes = [];
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
