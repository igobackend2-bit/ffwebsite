import type { Metadata } from 'next';
import { BreadcrumbJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'Live Farm Streams | Watch Our Farms in Real Time',
  description:
    'Total transparency — watch live streams from our partner farms. See your food being grown, harvested and packed. Trust, verified.',
  keywords: [
    'live farm stream', 'farm transparency', 'watch farm live', 'farm webcam', 'farm camera',
    'farmers factory live', 'live farm video', 'live vegetable farm', 'live organic farm',
    'where my food comes from', 'farm to table transparency', 'see your food being grown',
    'organic farm tour online', 'live harvest stream', 'farm livestream India',
  ],
  alternates: { canonical: `${SITE_URL}/streams` },
  openGraph: {
    title: 'Live Farm Streams — Farmers Factory',
    description: 'Watch our partner farms live. See your food grow.',
    url: `${SITE_URL}/streams`,
    siteName: 'Farmers Factory',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/banner-organic.webp`,
        width: 1200,
        height: 630,
        alt: 'Live Farm Streams — Farmers Factory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Farm Streams — Farmers Factory',
    description: 'Real-time transparency from our farms. Watch your produce being grown and harvested.',
    images: [`${SITE_URL}/banner-organic.webp`],
  },
};

export default function StreamsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrganizationJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Live Streams', url: '/streams' },
        ]}
      />
      {children}
    </>
  );
}
