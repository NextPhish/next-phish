import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("../../apps/next-app", import.meta.url).pathname,
      "next/navigation": new URL(
        "../../apps/next-app/node_modules/next/navigation.js",
        import.meta.url,
      ).pathname,
    },
  },
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.tsx"],
  },
});
