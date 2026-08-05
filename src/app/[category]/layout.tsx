import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BreadcrumbJsonLd, OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';
import { getKnownCategories } from '@/lib/categories';
import { resolveCategoryFromSlug } from '@/lib/categorySlug';
import { CATEGORY_META_OVERRIDES } from '@/lib/metaOverrides';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

type Params = { category: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const knownCategories = await getKnownCategories();
  const category = resolveCategoryFromSlug(slug, knownCategories);

  if (!category) {
    return {
      title: 'Category Not Found | Farmers Factory',
      robots: { index: false, follow: false },
    };
  }

  const override = CATEGORY_META_OVERRIDES[slug.toLowerCase()];
  const title = override?.title ?? `Buy Fresh ${category} Online | Farmers Factory`;
  const description =
    override?.description ??
    `Shop farm-direct organic ${category.toLowerCase()} — harvested today, delivered within 24 hours. Pure quality guaranteed by Farmers Factory.`;

  return {
    title,
    description,
    keywords: [
      `buy ${category.toLowerCase()} online`,
      `fresh ${category.toLowerCase()}`,
      `organic ${category.toLowerCase()} online`,
      `${category.toLowerCase()} home delivery`,
      'farmers factory',
    ],
    alternates: { canonical: `${SITE_URL}/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${slug}`,
      siteName: 'Farmers Factory',
      type: 'website',
      images: [
        { url: `${SITE_URL}/banner-organic.webp`, width: 1200, height: 630, alt: `${category} — Farmers Factory` },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/banner-organic.webp`],
    },
  };
}

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { category: slug } = await params;
  const knownCategories = await getKnownCategories();
  const category = resolveCategoryFromSlug(slug, knownCategories);

  if (!category) {
    notFound();
  }

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Shop', url: '/products' },
          { name: category, url: `/${slug}` },
        ]}
      />
      {children}
    </>
  );
}
