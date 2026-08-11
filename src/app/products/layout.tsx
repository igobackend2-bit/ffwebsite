import type { Metadata } from 'next';
import { BreadcrumbJsonLd, OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  // Absolute title — this string already ends in "Farmers Factory", so it
  // must not go through the root layout's "%s | Farmers Factory" template
  // (that was producing "... | Farmers Factory | Farmers Factory").
  title: { absolute: 'Shop Fresh Organic Fruits & Vegetables | Farmers Factory' },
  description:
    'Browse 100+ farm-direct organic fruits and vegetables. Same-day harvest, 24-hour delivery, pure quality guaranteed.',
  keywords: [
    // Brand
    'Farmers Factory', 'farmers factory online', 'farmers factory shop', 'farmers factory store',
    'igo farmers factory', 'igo groups farmers factory',
    // Organic / category
    'buy organic fruits online', 'buy organic vegetables online', 'organic produce online',
    'organic groceries online', 'organic store online India', 'organic food online',
    'organic shop near me', 'natural food store online', 'chemical free vegetables',
    'pesticide free fruits', 'farm fresh produce', 'farm direct vegetables',
    'farm to home delivery', 'fresh vegetables home delivery', 'fresh fruits home delivery',
    // Vegetables
    'buy vegetables online', 'fresh vegetables online', 'organic vegetables online',
    'leafy vegetables online', 'exotic vegetables online', 'green vegetables home delivery',
    'tomato online', 'onion online', 'potato online', 'carrot online', 'cabbage online',
    'spinach online', 'drumstick online', 'okra ladyfinger online', 'brinjal eggplant online',
    'cauliflower online', 'broccoli online', 'beetroot online', 'beans online',
    'capsicum online', 'mushroom online', 'green chilli online', 'ginger garlic online',
    // Fruits
    'buy fruits online', 'fresh fruits online', 'seasonal fruits online',
    'mango online', 'banana online', 'apple online', 'orange online', 'pomegranate online',
    'watermelon online', 'papaya online', 'sapota chikoo online', 'guava online',
    'sweet lime mosambi online', 'pineapple online', 'dragon fruit online', 'kiwi online',
    'strawberry online', 'amla gooseberry online', 'muskmelon online',
    // Locality (helps local SEO)
    'organic store Chennai', 'organic store Bangalore', 'organic store Coimbatore',
    'organic store Madurai', 'organic store Tamil Nadu', 'farm fresh Tamil Nadu',
    'vegetable delivery Chennai', 'fruit delivery Chennai',
    // Intent
    'best organic grocery', 'cheapest organic vegetables', 'same day vegetable delivery',
    '24 hour delivery organic', 'subscription vegetables online', 'monthly grocery online',
    'family pack vegetables', 'wholesale organic produce',
  ],
  alternates: { canonical: `${SITE_URL}/products` },
  openGraph: {
    title: 'Shop Farm-Direct Organic Produce | Farmers Factory',
    description:
      '100+ organic fruits and vegetables — harvested today, delivered tomorrow.',
    url: `${SITE_URL}/products`,
    siteName: 'Farmers Factory',
    type: 'website',
    images: [
      { url: `${SITE_URL}/banner-organic.webp`, width: 1200, height: 630, alt: 'Farmers Factory Shop' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Farm-Direct Organic Produce',
    description: 'Fresh fruits and vegetables — straight from our farms.',
    images: [`${SITE_URL}/banner-organic.webp`],
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Shop', url: '/products' },
        ]}
      />
      {children}
    </>
  );
}
