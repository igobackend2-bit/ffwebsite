// Server component for the product detail route.
// Deployment: Hostinger Node server (next build + node server.js), so each
// /products/<id> is rendered on demand. No static-export generateStaticParams
// is used here — that placeholder approach was only needed for static export
// and prevented real product IDs from being served on the Node server.
import ProductClient from './ProductClient';

// Render every product id dynamically at request time on the Node server.
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function ProductPage() {
  return <ProductClient />;
}
