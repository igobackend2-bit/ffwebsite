import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',      // generates out/ folder — uploadable to any static host
  trailingSlash: true,   // /products → /products/ — works with Apache directory serving
  images: {
    unoptimized: true,   // required: Next.js image optimization needs a server
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
