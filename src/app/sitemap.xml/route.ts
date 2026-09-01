import { supabase } from '@/lib/supabase';
import { categoryHref, productHref } from '@/lib/categorySlug';

export const dynamic = 'force-dynamic';

/**
 * Custom /sitemap.xml route — replaces the old app/sitemap.ts (Next.js's
 * built-in sitemap metadata API), which cannot attach a stylesheet.
 * Marketing wants /sitemap.xml to show a readable, branded page when
 * opened in a browser instead of the raw XML tag tree browsers show by
 * default, so this emits the same data by hand with a
 * <?xml-stylesheet?> instruction pointing at /sitemap.css.
 *
 * Search engines ignore that instruction completely and read the <url>
 * entries exactly as before — the actual list of pages, priorities, and
 * change frequencies is unchanged from the previous sitemap.ts.
 */

type SitemapEntry = {
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';
  const now = new Date().toISOString();

  const staticRoutes: SitemapEntry[] = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/llms.txt`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/delivery`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/streams`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    // Added: Help Center, Return Policy, Cookie Policy, FSSAI License
    { url: `${SITE_URL}/help`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/returns`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/fssai`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  let categoryRoutes: SitemapEntry[] = [];
  let productRoutes: SitemapEntry[] = [];

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
        changeFrequency: 'daily',
        priority: 0.9,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      productRoutes = nonValluvam.map((p: any) => ({
        url: `${SITE_URL}${productHref(p.category, p.name)}`,
        lastModified: p.updated_at
          ? new Date(p.updated_at).toISOString()
          : p.created_at
          ? new Date(p.created_at).toISOString()
          : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (_err) {
    // Silently fall back to static-only sitemap if Supabase is unreachable.
    categoryRoutes = [];
    productRoutes = [];
  }

  const allRoutes = [...staticRoutes, ...categoryRoutes, ...productRoutes];

  const body = allRoutes
    .map(
      (r) => `  <url>
    <loc>${escapeXml(r.url)}</loc>
    <lastmod>${r.lastModified}</lastmod>
    <changefreq>${r.changeFrequency}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/css" href="/sitemap.css"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
