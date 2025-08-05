import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
