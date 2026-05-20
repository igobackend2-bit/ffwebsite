import type { Metadata } from 'next';
import { BreadcrumbJsonLd, OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://farmersfactory.com';

export const metadata: Metadata = {
  title: 'About Us | Farmers Factory — Our Story, Mission & Sustainable Farming',
  description:
    'Learn about Farmers Factory — a direct-from-farm marketplace bringing organic fruits, vegetables and traditional Valluvam products from trusted farmers to your kitchen. Sustainability, purity and fair pay are at our core.',
  keywords: [
    'about farmers factory', 'farmers factory story', 'farmers factory team',
    'organic farm company India', 'organic agriculture company Tamil Nadu',
    'sustainable farming India', 'regenerative farming', 'natural farming',
    'farm to table India', 'farm to fork', 'direct from farmer marketplace',
    'farmer empowerment platform', 'fair trade farmers', 'no middleman organic',
    'organic produce company', 'iyarkai velanmai', 'valluvam products',
    'igo groups', 'igo farmers factory mission', 'pesticide free farming',
    'soil health India', 'eco friendly food brand',
  ],
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About Farmers Factory — Farm-Direct, Pure & Sustainable',
    description:
      'Our mission: connect organic farmers directly with conscious consumers — no middlemen, no chemicals, just fresh produce delivered in 24 hours.',
    url: `${SITE_URL}/about`,
    siteName: 'Farmers Factory',
    type: 'website',
    images: [
      { url: `${SITE_URL}/banner-organic.png`, width: 1200, height: 630, alt: 'About Farmers Factory' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Farmers Factory',
    description: 'Farm-direct, organic, sustainable — meet the team behind your fresh produce.',
    images: [`${SITE_URL}/banner-organic.png`],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' },
        ]}
      />
      {children}
    </>
  );
}
