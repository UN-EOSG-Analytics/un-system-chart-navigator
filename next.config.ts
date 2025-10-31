import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '', // Explicitly set to empty string for root deployment
  assetPrefix: '', // Explicitly set to empty string for root deployment
  images: {
    unoptimized: true
  },
  serverExternalPackages: ['d3-org-chart', 'd3'],
  // Optimize CSS loading
  experimental: {
    optimizeCss: true,
  }
};

export default nextConfig;
