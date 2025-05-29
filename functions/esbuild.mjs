import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  sourcemap: "inline",
  platform: "node",
  outfile: "./lib/index.js",
  external: ["firebase-functions", "pg-format"],
});
