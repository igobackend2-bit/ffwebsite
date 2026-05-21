import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'Secure Checkout | Farmers Factory',
  description: 'Complete your order securely on Farmers Factory.',
  alternates: { canonical: `${SITE_URL}/checkout` },
  robots: { index: false, follow: false, nocache: true },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
