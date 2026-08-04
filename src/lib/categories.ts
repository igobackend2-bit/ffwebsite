import { cache } from 'react';
import { supabase } from '@/lib/supabase';

// Categories that exist independently of the `products.category` column
// (filtered by a flag instead, e.g. is_seasonal) but still need a URL.
const PSEUDO_CATEGORIES = ['Seasonal'];

// Only used if Supabase is unreachable at request time, so /[category]
// pages never hard-fail just because the DB had a hiccup.
const FALLBACK_CATEGORIES = ['Fruits', 'Vegetables', 'Valluvam Products'];

/**
 * All category names currently in use, read fresh from the product table.
 * This is what makes /[category] future-proof: the moment a new category
 * value exists on an active product, its slug resolves here automatically
 * — no code changes needed. cache() dedupes this across the layout +
 * page render for the same request.
 */
export const getKnownCategories = cache(async (): Promise<string[]> => {
  try {
    const query = supabase
      .from('products')
      .select('category')
      .eq('is_active', true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data, error }: { data: any; error: any }) => (error ? null : data));

    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await Promise.race([query, timeout])) as any[] | null;

    const dbCategories: string[] = data
      ? Array.from(new Set(data.map((p) => p.category).filter(Boolean)))
      : [];

    const base = dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES;
    return Array.from(new Set([...base, ...PSEUDO_CATEGORIES]));
  } catch {
    return [...FALLBACK_CATEGORIES, ...PSEUDO_CATEGORIES];
  }
});
