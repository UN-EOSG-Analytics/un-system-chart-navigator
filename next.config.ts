import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Avoid bundling d3-org-chart on the server
      config.externals = config.externals || [];
      config.externals.push('d3-org-chart', 'd3');
    }
    return config;
  },
};

export default nextConfig;
