import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getKnownCategories } from '@/lib/categories';
import { resolveCategoryFromSlug } from '@/lib/categorySlug';
import { ProductsContent } from '@/app/products/page';

type Params = { category: string };

// The single dynamic route that serves every category (/vegetables,
// /fruits, /valluvam-products, and any future category) — no per-category
// page files. It resolves the URL slug against the categories that
// actually exist in the product data and renders the same product-listing
// UI as /products, pre-filtered.
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
