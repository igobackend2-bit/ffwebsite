import type { Metadata } from 'next';
import { BreadcrumbJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: '24-Hour Farm-to-Door Delivery',
  description:
    'Same-day harvest, next-day doorstep delivery. Track our cold-chain logistics, delivery zones, charges and free-shipping eligibility — all the freshness, none of the wait.',
  keywords: [
    'farm to door delivery', 'fresh produce delivery', 'same day vegetable delivery',
    'next day vegetable delivery', 'organic delivery near me', 'organic vegetable home delivery',
    'fresh fruits home delivery', 'farmers factory delivery', 'cold chain delivery',
    'free shipping organic', 'minimum order organic delivery', 'delivery zones farmers factory',
    'farm to home logistics', 'doorstep delivery vegetables', 'doorstep delivery fruits',
    'vegetable subscription box', 'weekly vegetable box', 'monthly grocery subscription',
    'cash on delivery organic', 'COD vegetables online', 'safe delivery vegetables',
    'farm to home Chennai', 'farm to home Coimbatore', 'farm to home Bangalore',
  ],
  alternates: { canonical: `${SITE_URL}/delivery` },
  openGraph: {
    title: '24-Hour Farm-to-Door Delivery | Farmers Factory',
    description:
      'Harvested today, delivered tomorrow — see our delivery zones, charges and free-shipping eligibility.',
    url: `${SITE_URL}/delivery`,
    siteName: 'Farmers Factory',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/banner-organic.webp`,
        width: 1200,
        height: 630,
        alt: 'Farmers Factory 24-Hour Delivery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '24-Hour Farm-to-Door Delivery | Farmers Factory',
    description: 'Same-day harvest, next-day delivery. Check our delivery zones and policies.',
    images: [`${SITE_URL}/banner-organic.webp`],
  },
};

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrganizationJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Delivery', url: '/delivery' },
        ]}
      />
      {children}
    </>
  );
}
