import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'Return Policy',
  description:
    'Our 100% quality guarantee, refund and replacement process for damaged, spoiled, or incorrect orders at Farmers Factory.',
  keywords: [
    'Farmers Factory return policy',
    'refund policy organic produce',
    'replacement policy',
    'famersfactory.com returns',
  ],
  alternates: { canonical: `${SITE_URL}/returns` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Return Policy | Farmers Factory',
    description: 'Our quality guarantee, refund and replacement process.',
    url: `${SITE_URL}/returns`,
    siteName: 'Farmers Factory',
    type: 'article',
    images: [
      {
        url: `${SITE_URL}/banner-organic.webp`,
        width: 1200,
        height: 630,
        alt: 'Farmers Factory Return Policy',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Return Policy | Farmers Factory',
    description: 'Our quality guarantee, refund and replacement process.',
  },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Return Policy', url: '/returns' },
        ]}
      />
      {children}
    </>
  );
}
