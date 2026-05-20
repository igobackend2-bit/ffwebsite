import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://farmersfactory.com';

export const metadata: Metadata = {
  title: 'Your Cart | Farmers Factory',
  description: 'Review the items in your cart and proceed to secure checkout.',
  alternates: { canonical: `${SITE_URL}/cart` },
  robots: { index: false, follow: false, nocache: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
