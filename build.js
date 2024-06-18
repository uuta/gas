import esbuild from "esbuild";
import { GasPlugin } from "esbuild-gas-plugin";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "public/index.js",
    plugins: [GasPlugin],
    define: { "globalThis.main": "main" },
  })
  .catch(() => process.exit(1));
