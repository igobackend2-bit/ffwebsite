import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Farmers Factory collects, uses and protects your personal information. Read our transparent privacy practices, your data rights and our commitment to your security.',
  keywords: [
    'Farmers Factory privacy policy',
    'data protection',
    'personal information policy',
    'privacy practices',
    'organic store privacy',
    'famersfactory.com privacy',
  ],
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Privacy Policy | Farmers Factory',
    description:
      'Our transparent approach to your data and privacy — what we collect, why, and how we keep it safe.',
    url: `${SITE_URL}/privacy`,
    siteName: 'Farmers Factory',
    type: 'article',
    images: [
      {
        url: `${SITE_URL}/banner-organic.webp`,
        width: 1200,
        height: 630,
        alt: 'Farmers Factory Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Farmers Factory',
    description: 'How Farmers Factory handles and protects your personal data.',
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
