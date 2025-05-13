import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lowlink.app", "kodmubndfoybzuzdjghn.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lowlink.app",
      },
      {
        protocol: "https",
        hostname: "kodmubndfoybzuzdjghn.supabase.co",
        pathname: "/storage/v1/object/public/profile-pictures/**",
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
