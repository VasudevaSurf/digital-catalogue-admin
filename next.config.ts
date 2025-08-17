import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optionally add this for stricter skipping
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
