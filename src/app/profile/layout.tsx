import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://farmersfactory.com';

export const metadata: Metadata = {
  title: 'My Profile | Farmers Factory',
  description: 'Manage your Farmers Factory account, addresses, loyalty rewards and preferences.',
  alternates: { canonical: `${SITE_URL}/profile` },
  robots: { index: false, follow: false, nocache: true },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
