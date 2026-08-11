import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getKnownCategories } from '@/lib/categories';
import { resolveCategoryFromSlug } from '@/lib/categorySlug';
import { ProductsContent } from '@/app/products/page';

type Params = { category: string };

// Re-check the DB / meta overrides every hour instead of caching a category
// page forever after its first visit — see the matching note in
// [category]/[product]/page.tsx for why this matters.
export const revalidate = 3600;

// The single dynamic route that serves every category (/vegetables,
// /fruits, and any future fruit/vegetable category) — no per-category page
// files. It resolves the URL slug against the categories that actually
// exist in the product data and renders the same product-listing UI as
// /products, pre-filtered.
export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category: slug } = await params;
  const knownCategories = await getKnownCategories();
  const category = resolveCategoryFromSlug(slug, knownCategories);

  // Not a real category slug (e.g. a typo) — show a real 404 rather than
  // silently rendering an empty/misleading listing.
  if (!category) {
    notFound();
  }

  // Farmers Factory only sells Fruits and Vegetables now. Everything else
  // (Spices, Millets, Oils, Dry Fruits & Seeds, Honey & Jaggery, Valluvam
  // Products, and any other legacy/traditional category still sitting in
  // the product data) moved to https://www.valluvamproducts.com/ — send
  // visitors there instead of rendering a retired category page.
  if (!['fruits', 'vegetables'].includes(category.toLowerCase())) {
    redirect('https://www.valluvamproducts.com/');
  }

  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      }
    >
      <ProductsContent initialCategory={category} />
    </Suspense>
  );
}
