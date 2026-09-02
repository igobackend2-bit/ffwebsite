import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'Delete Account',
  description:
    'How to permanently delete your Farmers Factory account and data — profile, orders, cart, wishlist, addresses and notifications.',
  keywords: [
    'Farmers Factory delete account',
    'delete my account',
    'account deletion',
    'data deletion request',
    'famersfactory.com delete account',
  ],
  alternates: { canonical: `${SITE_URL}/delete-account` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Delete Account | Farmers Factory',
    description: 'Request permanent deletion of your Farmers Factory account and all associated data.',
    url: `${SITE_URL}/delete-account`,
    siteName: 'Farmers Factory',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Delete Account | Farmers Factory',
    description: 'Request permanent deletion of your Farmers Factory account and all associated data.',
  },
};

export default function DeleteAccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Delete Account', url: '/delete-account' },
        ]}
      />
      {children}
    </>
  );
}
