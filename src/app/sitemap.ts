import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-static';

/**
 * Dynamic sitemap for Farmers Factory.
 * Combines:
 *   1. Static public canonical routes (no query-string URLs — those conflict
 *      with the /products canonical and send mixed signals to Google).
 *   2. Dynamic product detail pages pulled from Supabase.
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

  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, updated_at, created_at')
      .eq('is_active', true)
      .limit(5000);

    if (!error && data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      productRoutes = data.map((p: any) => ({
        url: `${SITE_URL}/products/${p.id}`,
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
    productRoutes = [];
  }

  return [...staticRoutes, ...productRoutes];
}
