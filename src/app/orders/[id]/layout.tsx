import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Details',
  description: 'View your order details on Farmers Factory.',
  robots: { index: false, follow: false, nocache: true },
};

// generateStaticParams must return at least one entry for `output: export`.
// The "_placeholder" entry generates a dummy HTML shell that is never served to users
// (the .htaccess SPA fallback routes all real order IDs through the client router instead).
export function generateStaticParams() {
  return [{ id: '_placeholder' }];
}

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
