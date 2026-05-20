import type { MetadataRoute } from 'next';

/**
 * Next.js native robots.ts (App Router).
 * This complements public/robots.txt — Next.js will serve this dynamically.
 * If both exist, public/robots.txt typically wins; we keep both for compatibility.
 */
export default function robots(): MetadataRoute.Robots {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://farmersfactory.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/products', '/contact', '/delivery', '/privacy', '/terms', '/streams'],
        disallow: [
          '/admin',
          '/admin/',
          '/auth',
          '/auth/',
          '/checkout',
          '/checkout/',
          '/orders',
          '/orders/',
          '/profile',
          '/profile/',
          '/cart',
          '/api/',
          '/*?*',
        ],
      },
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'anthropic-ai', disallow: '/' },
      { userAgent: 'ClaudeBot', disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
