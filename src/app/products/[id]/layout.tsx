import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ProductJsonLd } from '@/components/seo/JsonLd';
import { supabase } from '@/lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

type Params = { id: string };

async function getProduct(id: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, images, category, stock, rating, review_count, sku')
      .eq('id', id)
      .single();
    if (error) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data as any;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product | Farmers Factory',
      description: 'Discover farm-direct organic produce at Farmers Factory.',
      alternates: { canonical: `${SITE_URL}/products/${id}` },
    };
  }

  const title = `${product.name} — Buy Fresh ${product.category || 'Organic Produce'} Online | Farmers Factory`;
  const description =
    (product.description && String(product.description).slice(0, 160)) ||
    `Buy fresh ${product.name} online — farm-direct, organic, harvested today and delivered in 24 hours. Pure quality guaranteed by Farmers Factory.`;

  const image =
    product.image_url ||
    (Array.isArray(product.images) && product.images[0]) ||
    `${SITE_URL}/placeholder_product.webp`;

  return {
    title,
    description,
    keywords: [
      `buy ${product.name} online`,
      `${product.name} price`,
      `fresh ${product.name}`,
      `organic ${product.name}`,
      `${product.category} online`,
      'farm fresh',
      'farmers factory',
    ],
    alternates: { canonical: `${SITE_URL}/products/${id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/products/${id}`,
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

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <>
      {product && (
        <ProductJsonLd
          id={String(product.id)}
          name={product.name}
          description={product.description}
          image={
            product.image_url ||
            (Array.isArray(product.images) && product.images[0]) ||
            undefined
          }
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
      )}
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Shop', url: '/products' },
          {
            name: product?.name || 'Product',
            url: `/products/${id}`,
          },
        ]}
      />
      {children}
    </>
  );
}
