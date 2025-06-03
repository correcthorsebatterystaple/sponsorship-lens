import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./src/index.ts"],
  bundle: false,
  minify: true,
  sourcemap: "external",
  platform: "node",
  outfile: "./lib/index.js",
});
