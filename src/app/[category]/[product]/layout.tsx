import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BreadcrumbJsonLd, ProductJsonLd } from '@/components/seo/JsonLd';
import { getKnownCategories } from '@/lib/categories';
import { resolveCategoryFromSlug } from '@/lib/categorySlug';
import { getProductBySlug } from '@/lib/products';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

type Params = { category: string; product: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category: categorySlug, product: productSlug } = await params;

  const knownCategories = await getKnownCategories();
  const category = resolveCategoryFromSlug(categorySlug, knownCategories);
  const product = category ? await getProductBySlug(category, productSlug) : null;

  if (!category || !product) {
    return {
      title: 'Product Not Found | Farmers Factory',
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.name} — Buy Fresh ${category} Online | Farmers Factory`;
  const description =
    (product.description && String(product.description).slice(0, 160)) ||
    `Buy fresh ${product.name} online — farm-direct, organic, harvested today and delivered in 24 hours. Pure quality guaranteed by Farmers Factory.`;

  const image =
    product.image_url ||
    (Array.isArray(product.image_urls) && product.image_urls[0]) ||
    `${SITE_URL}/placeholder_product.webp`;

  const url = `${SITE_URL}/${categorySlug}/${productSlug}`;

  return {
    title,
    description,
    keywords: [
      `buy ${product.name} online`,
      `${product.name} price`,
      `fresh ${product.name}`,
      `organic ${product.name}`,
      `${category} online`,
      'farm fresh',
      'farmers factory',
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Farmers Factory',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  return (
    <>
      <ProductJsonLd
        id={String(product.id)}
        name={product.name}
        description={product.description}
        image={product.image_url || (Array.isArray(product.image_urls) && product.image_urls[0]) || undefined}
        price={product.price}
        availability={
          product.stock && Number(product.stock) > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock'
        }
        sku={product.sku || String(product.id)}
        ratingValue={product.rating}
        reviewCount={product.review_count}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: category, url: `/${categorySlug}` },
          { name: product.name, url: `/${categorySlug}/${productSlug}` },
        ]}
      />
      {children}
    </>
  );
}
