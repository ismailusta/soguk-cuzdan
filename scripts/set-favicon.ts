import sharp from "sharp";
import { copyFileSync, existsSync, unlinkSync } from "fs";
import path from "path";

/**
 * Generate app icons from brand logo as real PNGs (never write PNG bytes to .ico).
 */
const root = process.cwd();
const src = path.join(root, "public/brand/logo-v2.png");
const appDir = path.join(root, "src/app");

for (const bad of [
  path.join(appDir, "favicon.ico"),
  path.join(root, "public/favicon.ico"),
]) {
  if (existsSync(bad)) {
    unlinkSync(bad);
    console.log("removed", bad);
  }
}

// Full-res icon — Next.js serves / generates favicon from this
copyFileSync(src, path.join(appDir, "icon.png"));
await sharp(src).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));
copyFileSync(src, path.join(root, "public/brand/icon-v2.png"));

console.log("icons OK (PNG only)");
