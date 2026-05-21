import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export const metadata: Metadata = {
  title: 'Sign In or Sign Up | Farmers Factory',
  description: 'Sign in to your Farmers Factory account or create a new one to start ordering farm-fresh produce.',
  alternates: { canonical: `${SITE_URL}/auth` },
  robots: { index: false, follow: false, nocache: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
