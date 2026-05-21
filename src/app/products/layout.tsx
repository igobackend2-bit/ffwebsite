import type { Metadata } from 'next';
import { BreadcrumbJsonLd, OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'Shop Fresh Organic Fruits, Vegetables & Valluvam Products | Farmers Factory',
  description:
    'Browse 100+ farm-direct organic fruits, vegetables, millets, cold-pressed oils, honey, ghee and traditional Valluvam products. Same-day harvest, 24-hour delivery, pure quality guaranteed.',
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
    // Valluvam / Traditional
    'valluvam products', 'tamil traditional products online', 'iyarkai products',
    'native foods online', 'traditional foods online',
    // Millets
    'organic millets online', 'foxtail millet online', 'kodo millet online',
    'barnyard millet online', 'little millet online', 'pearl millet online',
    'browntop millet online', 'sorghum cholam online', 'thinai online', 'varagu online',
    // Oils
    'cold pressed oil', 'chekku oil online', 'wood pressed oil online',
    'cold pressed coconut oil', 'cold pressed groundnut oil', 'cold pressed sesame oil',
    'cold pressed gingelly oil', 'marachekku oil', 'ennai online',
    // Dairy / Sweeteners
    'a2 ghee online', 'pure ghee online', 'buffalo ghee online', 'desi ghee online',
    'palm jaggery online', 'karuppatti online', 'panai vellam online',
    'natural honey online', 'raw honey online', 'amla honey online',
    // Spices / Pantry
    'spices online', 'whole spices online', 'cardamom online', 'cinnamon online',
    'cloves online', 'black pepper online', 'cumin jeera online', 'mustard seeds online',
    'fennel seeds online', 'fenugreek methi online', 'bay leaves online', 'star anise online',
    // Dry fruits / Seeds
    'dry fruits online', 'cashew nuts online', 'almonds online', 'pistachio online',
    'walnut online', 'figs online', 'dates online', 'raisins online', 'kismis online',
    'chia seeds online', 'flax seeds online', 'pumpkin seeds online', 'sunflower seeds online',
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
      '100+ organic fruits, vegetables, millets, oils & traditional products — harvested today, delivered tomorrow.',
    url: `${SITE_URL}/products`,
    siteName: 'Farmers Factory',
    type: 'website',
    images: [
      { url: `${SITE_URL}/banner-organic.png`, width: 1200, height: 630, alt: 'Farmers Factory Shop' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Farm-Direct Organic Produce',
    description: 'Fresh fruits, vegetables and Valluvam essentials — straight from our farms.',
    images: [`${SITE_URL}/banner-organic.png`],
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
