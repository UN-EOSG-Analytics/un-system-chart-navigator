import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Ensure proper static file handling
  experimental: {
    // Optimize for parallel routes
    parallelServerBuildTraces: true,
  },
  // Configure headers for better caching
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Ensure all static assets are included in standalone build
  images: {
    unoptimized: true
  },
};

export default nextConfig;
