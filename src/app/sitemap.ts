import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

/**
 * Dynamic sitemap for Farmers Factory.
 * Combines:
 *   1. Static public routes
 *   2. Dynamic product detail pages pulled from Supabase
 *
 * Safe-fails: if Supabase is unreachable at build time, only static routes are returned.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://farmersfactory.com';

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
    // Category filter pages (deep linkable)
    {
      url: `${SITE_URL}/products?category=Fruits`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/products?category=Vegetables`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/products?category=Valluvam%20Products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/products?category=Seasonal`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, updated_at, created_at')
      .limit(5000);

    if (!error && data) {
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
