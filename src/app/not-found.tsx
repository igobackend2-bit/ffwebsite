import Link from 'next/link';
import { Leaf, Home, ShoppingBasket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Custom branded 404 — Next.js falls back to a bare, unstyled default page
// for any unmatched route unless this file exists. Also gives Google
// Search Console's coverage report a real, consistent 404 response instead
// of a generic one.
export const metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-32">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
            <Leaf size={36} />
          </div>
          <h1 className="text-6xl font-black text-foreground tracking-tighter mb-3">404</h1>
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mb-3">
            This page isn&apos;t in our harvest
          </h2>
          <p className="text-muted-foreground font-medium mb-10">
            The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back to fresh produce.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Home size={16} />
              Back to Home
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-muted text-foreground px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted/70 transition-all"
            >
              <ShoppingBasket size={16} />
              Shop Products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
