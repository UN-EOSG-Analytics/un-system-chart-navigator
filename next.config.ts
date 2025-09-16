import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['d3-org-chart', 'd3']
};

export default nextConfig;
