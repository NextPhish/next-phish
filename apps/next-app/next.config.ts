import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@next-phish/ui"],
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
