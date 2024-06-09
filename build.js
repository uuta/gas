import esbuild from "esbuild";
import { GasPlugin } from "esbuild-gas-plugin";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "public/index.js",
    plugins: [GasPlugin],
    minify: true,
  })
  .catch(() => process.exit(1));
