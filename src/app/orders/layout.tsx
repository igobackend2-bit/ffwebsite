import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'My Orders | Farmers Factory',
  description: 'View and track your orders on Farmers Factory.',
  alternates: { canonical: `${SITE_URL}/orders` },
  robots: { index: false, follow: false, nocache: true },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
