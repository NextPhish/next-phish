import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Avoid unbounded disk growth during long development sessions.
    turbopackFileSystemCacheForDev: false,
  },
  transpilePackages: ["@next-phish/ui"],
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
