import { build } from "esbuild";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const service = process.argv[2];
if (!["worker", "static-server"].includes(service)) {
  throw new Error("Expected worker or static-server");
}
const root = fileURLToPath(new URL("../", import.meta.url));
await build({
  absWorkingDir: resolve(root, "apps", service),
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  target: "node24",
  format: "cjs",
  sourcemap: true,
  // These packages load native clients, Lua files or logging workers at runtime.
  external: ["@prisma/client", "bullmq", "pino"],
  logLevel: "info",
});
