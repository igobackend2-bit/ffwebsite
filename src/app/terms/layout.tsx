import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'The Terms & Conditions that govern the use of famersfactory.com — orders, payments, refunds, returns, intellectual property and user responsibilities.',
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Terms & Conditions | Farmers Factory',
    description:
      'Rules governing the use of Farmers Factory — orders, payments, refunds, returns and your rights.',
    url: `${SITE_URL}/terms`,
    siteName: 'Farmers Factory',
    type: 'article',
    images: [
      {
        url: `${SITE_URL}/banner-organic.webp`,
        width: 1200,
        height: 630,
        alt: 'Farmers Factory Terms & Conditions',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Terms & Conditions | Farmers Factory',
    description: 'Read the terms governing your use of Farmers Factory.',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Terms & Conditions', url: '/terms' },
        ]}
      />
      {children}
    </>
  );
}
