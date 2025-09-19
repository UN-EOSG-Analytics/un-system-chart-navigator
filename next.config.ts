import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  serverExternalPackages: ['d3-org-chart', 'd3']
};

export default nextConfig;
