import type { NextConfig } from "next";

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
