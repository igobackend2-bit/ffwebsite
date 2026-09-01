import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Answers to common questions about orders, delivery slots, payments, delivery areas, and returns at Farmers Factory.',
  keywords: [
    'Farmers Factory help center',
    'Farmers Factory FAQ',
    'order and delivery help',
    'famersfactory.com support',
  ],
  alternates: { canonical: `${SITE_URL}/help` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Help Center | Farmers Factory',
    description: 'Answers to what our customers ask us most — orders, delivery, payments and returns.',
    url: `${SITE_URL}/help`,
    siteName: 'Farmers Factory',
    type: 'article',
    images: [
      {
        url: `${SITE_URL}/banner-organic.webp`,
        width: 1200,
        height: 630,
        alt: 'Farmers Factory Help Center',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Help Center | Farmers Factory',
    description: 'Answers to what our customers ask us most.',
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Help Center', url: '/help' },
        ]}
      />
      {children}
    </>
  );
}
