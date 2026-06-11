import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizeCss: true,
  },
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
