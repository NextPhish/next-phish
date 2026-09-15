import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@next-phish/ui"],
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
