import { cache } from 'react';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/categorySlug';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProduct(data: any) {
  return {
    ...data,
    image_url: data.image_url || (data.image_urls && data.image_urls[0]) || '/placeholder_product.webp',
    image_urls: data.image_urls || [data.image_url].filter(Boolean) || [],
  };
}

/**
 * All active products in a category, read fresh from the DB. cache()
 * dedupes this across the layout + page render for the same request, and
 * across getProductBySlug() calls that need the same list.
 */
export const getProductsByCategory = cache(async (category: string) => {
  try {
    const query = supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data, error }: { data: any; error: any }) => (error ? [] : data));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeout = new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 2500));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await Promise.race([query, timeout])) as any[];
    return (data || []).map(normalizeProduct);
  } catch {
    return [];
  }
});

/**
 * Resolve a product URL slug to the actual product row within a category.
 * If more than one active product in the category slugifies to the same
 * value (e.g. two products both named "Tomato"), the most recently
 * updated one wins — deterministic rather than an arbitrary DB order.
 */
export const getProductBySlug = cache(async (category: string, slug: string) => {
  const products = await getProductsByCategory(category);
  const target = slugify(slug);
  const matches = products.filter((p) => slugify(p.name) === target);

  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];

  return matches.sort((a, b) => {
    const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
    const bDate = new Date(b.updated_at || b.created_at || 0).getTime();
    return bDate - aDate;
  })[0];
});
