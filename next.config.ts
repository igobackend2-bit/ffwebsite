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

  // ── HTTP Cache-Control headers ────────────────────────────────────────────
  async headers() {
    return [
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
};

export default nextConfig;
