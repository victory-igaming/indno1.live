import type { NextConfig } from "next";

const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0];

const nextConfig: NextConfig = {
  allowedDevOrigins: replitDomain ? [replitDomain] : [],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
