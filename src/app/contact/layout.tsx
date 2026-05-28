import type { Metadata } from 'next';
import { BreadcrumbJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'Contact Us — Customer Support & Farm Partnerships',
  description:
    'Get in touch with Farmers Factory for orders, partnerships, farm sourcing or support. We reply within 24 hours — your direct line to fresh, organic produce.',
  keywords: [
    'contact farmers factory', 'farmers factory support', 'farmers factory helpline',
    'farmers factory customer care', 'farmers factory phone number', 'farmers factory email',
    'farmers factory address', 'organic supplier contact', 'farm partnership India',
    'bulk order organic produce', 'B2B organic supplier', 'wholesale enquiry organic',
    'become a partner farmer', 'sell on farmers factory', 'farmer onboarding',
    'customer service farmers factory', 'organic produce enquiry',
  ],
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: 'Contact Farmers Factory — Support & Partnerships',
    description: 'We reply within 24 hours — your direct line to fresh, organic produce and farm partnerships.',
    url: `${SITE_URL}/contact`,
    siteName: 'Farmers Factory',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/banner-organic.webp`,
        width: 1200,
        height: 630,
        alt: 'Contact Farmers Factory',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Contact Farmers Factory',
    description: 'Reach out for orders, partnerships and support. We reply within 24 hours.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrganizationJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' },
        ]}
      />
      {children}
    </>
  );
}
