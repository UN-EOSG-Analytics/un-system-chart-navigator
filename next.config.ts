import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    // Ensure TypeScript path mapping works correctly
    typedRoutes: true,
  },
  // Ensure webpack resolves path aliases correctly
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('./src'),
    };
    return config;
  },
};

export default nextConfig;
