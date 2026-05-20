import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://farmersfactory.com';

export const metadata: Metadata = {
  title: 'Privacy Policy | Farmers Factory',
  description:
    'How Farmers Factory collects, uses and protects your personal information. Read our transparent privacy practices, your data rights and our commitment to your security.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Privacy Policy | Farmers Factory',
    description: 'Our transparent approach to your data and privacy.',
    url: `${SITE_URL}/privacy`,
    siteName: 'Farmers Factory',
    type: 'article',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy' },
        ]}
      />
      {children}
    </>
  );
}
