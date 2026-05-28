import type { NextConfig } from "next";

// Hostinger Node.js Web App deployment:
// - Runs: npm install → npm run build → npm start (next start)
// - "next start" requires a proper Next.js server build — NOT a static export.

const nextConfig: NextConfig = {
  // ── Performance ──────────────────────────────────────────────────────────
  compress: true,          // Enable gzip/brotli compression on responses
  poweredByHeader: false,  // Remove "X-Powered-By: Next.js" header (security + tiny perf)
  
  // Tree-shake heavy packages so only used icons/components are bundled
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@supabase/supabase-js',
    ],
  },

  // ── Images ───────────────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'], // Prefer AVIF > WebP > JPEG/PNG
    minimumCacheTTL: 31536000,             // Cache optimised images for 1 year
    remotePatterns: [
      { protocol: 'https', hostname: 'celsdwfmogpejwzbkxad.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },

  // ── HTTP Cache-Control headers for static assets ─────────────────────────
  async headers() {
    return [
      {
        // Immutable cache for hashed Next.js static chunks (JS/CSS/fonts)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Long cache for public images, fonts, icons, video
        source: '/:path*.(webp|png|jpg|jpeg|svg|gif|ico|woff2|woff|ttf|mp4|webm)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
