import { notFound } from 'next/navigation';
import { getKnownCategories } from '@/lib/categories';
import { resolveCategoryFromSlug } from '@/lib/categorySlug';
import { getProductBySlug, getProductsByCategory } from '@/lib/products';
import ProductDetailClient from './ProductDetailClient';

type Params = { category: string; product: string };

// The single dynamic route that serves every product in every category
// (/vegetables/tomato, /fruits/apple, /valluvam-products/neem-oil, and any
// future category/product) — no per-product page files. It resolves both
// URL slugs against real data server-side, then renders the existing
// product-detail UI with that product pre-loaded.
export default async function CategoryProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category: categorySlug, product: productSlug } = await params;

  const knownCategories = await getKnownCategories();
  const category = resolveCategoryFromSlug(categorySlug, knownCategories);
  if (!category) {
    notFound();
  }

  const product = await getProductBySlug(category, productSlug);
  if (!product) {
    notFound();
  }

  const categoryProducts = await getProductsByCategory(category);
  const relatedProducts = categoryProducts.filter((p) => p.id !== product.id).slice(0, 8);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
