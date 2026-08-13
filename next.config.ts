import type { NextConfig } from "next";

// Hostinger Node.js Web App deployment:
// - Runs: npm install → npm run build → npm start (next start)
// - "next start" requires a proper Next.js server build — NOT a static export.

const nextConfig: NextConfig = {
  // ── Performance ──────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@supabase/supabase-js',
    ],
  },

  // ── Images ───────────────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: 'qwiumswrbddwmlraktvy.supabase.co' },
      // Legacy (old website DB — keep until fully migrated)
      { protocol: 'https', hostname: 'celsdwfmogpejwzbkxad.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },

  // ── HTTP Cache-Control + security headers ─────────────────────────────────
  async headers() {
    return [
      {
        // Applies to every response. HSTS tells browsers that already know
        // this site to always use HTTPS directly (skipping the initial
        // http:// -> https:// redirect round-trip) and protects against
        // SSL-stripping attacks. The site already 301-redirects http -> https
        // and www -> non-www at the routing level; this header reinforces
        // that at the browser level. `preload` is omitted since submitting to
        // the HSTS preload list is a one-way, hard-to-reverse decision that
        // should be a deliberate choice by whoever owns the domain, not
        // something bundled into an unrelated code change.
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.(webp|png|jpg|jpeg|svg|gif|ico|woff2|woff|ttf|mp4|webm)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, stale-while-revalidate=86400' },
        ],
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // ── Valluvam Products moved to an external site ────────────────────────────
  // Valluvam Products are no longer sold on Farmers Factory — any old link to
  // the internal /valluvam-products shop (bookmarks, Google's old index, etc.)
  // now sends the visitor straight to the dedicated Valluvam site instead.
  async redirects() {
    return [
      {
        source: '/valluvam-products',
        destination: 'https://www.valluvamproducts.com/',
        permanent: true,
      },
      {
        source: '/valluvam-products/:path*',
        destination: 'https://www.valluvamproducts.com/',
        permanent: true,
      },
      // www -> non-www (matches the canonical URL every page already
      // declares). Without this, both hosts served the same content
      // directly with no redirect between them — duplicate-content
      // exposure to search engines.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.famersfactory.com' }],
        destination: 'https://famersfactory.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
