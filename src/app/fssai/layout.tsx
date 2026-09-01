import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'FSSAI License',
  description:
    'FSSAI food safety license and compliance information for Farmers Factory.',
  keywords: [
    'Farmers Factory FSSAI license',
    'FSSAI compliance',
    'food business operator license',
    'famersfactory.com FSSAI',
  ],
  alternates: { canonical: `${SITE_URL}/fssai` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'FSSAI License | Farmers Factory',
    description: 'Our FSSAI food safety license and compliance information.',
    url: `${SITE_URL}/fssai`,
    siteName: 'Farmers Factory',
    type: 'article',
    images: [
      {
        url: `${SITE_URL}/banner-organic.webp`,
        width: 1200,
        height: 630,
        alt: 'Farmers Factory FSSAI License',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'FSSAI License | Farmers Factory',
    description: 'Our FSSAI food safety license and compliance information.',
  },
};

export default function FssaiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'FSSAI License', url: '/fssai' },
        ]}
      />
      {children}
    </>
  );
}
