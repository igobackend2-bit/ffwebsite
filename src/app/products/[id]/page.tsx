// Server component — owns generateStaticParams (required for static export).
// Actual UI lives in ProductClient (client component) so it can use hooks.
import ProductClient from './ProductClient';

export function generateStaticParams() {
  // The "_placeholder" entry satisfies static-export requirements.
  // The .htaccess SPA fallback handles all real product IDs via the client router at runtime.
  return [{ id: '_placeholder' }];
}

export default function ProductPage() {
  return <ProductClient />;
}
