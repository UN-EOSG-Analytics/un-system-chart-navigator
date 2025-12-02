import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // For GitHub Pages deployment should be `true`
  basePath: "", // Explicitly set to empty string for root deployment
  assetPrefix: "", // Explicitly set to empty string for root deployment
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["d3-org-chart", "d3"],
  // Optimize CSS loading
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
