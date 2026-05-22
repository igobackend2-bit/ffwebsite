import type { NextConfig } from "next";

// Static export only applies to production builds (npm run build).
// Dev mode (npm run dev) uses the full Next.js server — API routes, HMR, and
// middleware all work normally so you get the complete local dev experience.
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  ...(isProd && {
    output: 'export',    // generates out/ folder — uploadable to any static host
    trailingSlash: true, // /products → /products/ — works with Apache directory serving
  }),
  images: {
    unoptimized: isProd, // only disable optimization in production static export
    remotePatterns: [
      { protocol: 'https', hostname: 'celsdwfmogpejwzbkxad.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' }
    ]
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
