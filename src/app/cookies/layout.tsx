import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How Farmers Factory uses cookies and similar technologies on our website and app, and how to control them.',
  keywords: [
    'Farmers Factory cookie policy',
    'cookies website',
    'famersfactory.com cookies',
  ],
  alternates: { canonical: `${SITE_URL}/cookies` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Cookie Policy | Farmers Factory',
    description: 'How we use cookies, and how to control them.',
    url: `${SITE_URL}/cookies`,
    siteName: 'Farmers Factory',
    type: 'article',
    images: [
      {
        url: `${SITE_URL}/banner-organic.webp`,
        width: 1200,
        height: 630,
        alt: 'Farmers Factory Cookie Policy',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Cookie Policy | Farmers Factory',
    description: 'How we use cookies, and how to control them.',
  },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Cookie Policy', url: '/cookies' },
        ]}
      />
      {children}
    </>
  );
}
