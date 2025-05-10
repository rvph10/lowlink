import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lowlink.app"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lowlink.app",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "lowlink.app", "https://lowlink.app"],
    },
  },
};

export default nextConfig;
