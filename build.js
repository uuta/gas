import esbuild from "esbuild";
import { GasPlugin } from "esbuild-gas-plugin";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "public/app.js",
    plugins: [GasPlugin],
  })
  .catch(() => process.exit(1));
