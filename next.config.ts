import type { NextConfig } from "next";

// Hostinger Node.js Web App deployment:
// - Runs: npm install → npm run build → npm start (next start)
// - "next start" requires a proper Next.js server build — NOT a static export.
// - Static export (output: 'export') is INCOMPATIBLE with "next start" and
//   causes the Node.js process to crash immediately on startup, which is why
//   the site served logo.png instead of the actual HTML.
//
// For local dev: npm run dev works as normal — full HMR, API routes, middleware.

const nextConfig: NextConfig = {
  images: {
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
