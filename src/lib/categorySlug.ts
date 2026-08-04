// Generic slug helpers for category navigation.
//
// There is no hardcoded per-category map here on purpose: any category
// name automatically gets a working slug (and any slug automatically
// resolves back to its category), so a brand-new category showing up in
// the product data works immediately — no code changes required.

/** "Valluvam Products" -> "valluvam-products" */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Build the URL for a given category name, e.g. "Vegetables" -> "/vegetables". */
export function categoryHref(category: string): string {
  if (!category || category === 'All') return '/products';
  return `/${slugify(category)}`;
}

/**
 * Given a URL slug and the list of real category names currently in use,
 * find the matching category name (slug-insensitive). Returns null if no
 * known category matches the slug.
 */
export function resolveCategoryFromSlug(slug: string, knownCategories: string[]): string | null {
  const target = slugify(slug);
  return knownCategories.find((c) => slugify(c) === target) || null;
}

/**
 * Build the full nested URL for a product, e.g.
 * ("Vegetables", "Fresh Tomato") -> "/vegetables/fresh-tomato".
 * The category is always part of the URL, per the site's URL structure.
 */
export function productHref(category: string, name: string): string {
  return `${categoryHref(category)}/${slugify(name)}`;
}
