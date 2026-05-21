import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Farmers Factory',
  description:
    'The Terms & Conditions that govern the use of farmersfactory.com — orders, payments, refunds, returns, intellectual property and user responsibilities.',
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Terms & Conditions | Farmers Factory',
    description: 'Rules of using Farmers Factory.',
    url: `${SITE_URL}/terms`,
    siteName: 'Farmers Factory',
    type: 'article',
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
