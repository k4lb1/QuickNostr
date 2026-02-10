const esbuild = require("esbuild");
const path = require("path");

esbuild
  .build({
    entryPoints: [path.join(__dirname, "nostr-tools-entry.js")],
    bundle: true,
    format: "iife",
    outfile: path.join(__dirname, "dist", "nostr-tools-bundle.js"),
    minify: true,
  })
  .then(() => {
    console.log("dist/nostr-tools-bundle.js erstellt.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

