// Generates the placeholder PWA icon set from a plain monochrome SVG mark
// (two concentric circles — a calm, minimal stand-in for Proyecto SER's
// real logo, which doesn't exist as a project asset yet). Run with:
//
//   node scripts/generate-pwa-icons.mjs
//
// Re-run this after swapping in a real logo: replace the two SVG strings
// below with markup derived from the final brand mark, keeping the same
// output file list, then re-run.
//
// See docs/PWA.md for which of these files are safe-to-ship placeholders
// and which need to be replaced before an App Store / Play Store release.

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const BLACK = "#000000";
const FOREGROUND = "#f4f4f5"; // Tailwind zinc-100, matching the app's on-dark text color

// Standard "any" mark: generous natural padding already (ring diameter is
// ~59% of the canvas), safe to reuse as-is for favicons and the apple
// touch icon.
const standardSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${BLACK}"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="${FOREGROUND}" stroke-width="14"/>
  <circle cx="256" cy="256" r="54" fill="${FOREGROUND}"/>
</svg>
`;

// Maskable variant: same mark, scaled further inward so it survives every
// OS mask shape (circle, squircle, rounded-square) without clipping — kept
// within the center ~50% of the canvas, well inside the 80% "safe zone"
// maskable icons are expected to respect.
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${BLACK}"/>
  <circle cx="256" cy="256" r="120" fill="none" stroke="${FOREGROUND}" stroke-width="12"/>
  <circle cx="256" cy="256" r="42" fill="${FOREGROUND}"/>
</svg>
`;

async function main() {
  await mkdir("public/icons", { recursive: true });

  const standard = Buffer.from(standardSvg);
  const maskable = Buffer.from(maskableSvg);

  await sharp(standard).resize(192, 192).png().toFile("public/icons/icon-192.png");
  await sharp(standard).resize(512, 512).png().toFile("public/icons/icon-512.png");
  await sharp(maskable).resize(512, 512).png().toFile("public/icons/icon-512-maskable.png");

  // Apple touch icon: iOS applies its own rounded-square mask, so this
  // ships full-bleed (no transparency, no extra padding) at 180x180.
  await sharp(standard)
    .resize(180, 180)
    .flatten({ background: BLACK })
    .png()
    .toFile("public/icons/apple-touch-icon-180.png");

  // Next.js file-convention copies: `app/icon.png` and `app/apple-icon.png`
  // are auto-detected and injected as <link rel="icon"> / <link rel="apple-touch-icon">.
  await sharp(standard).resize(192, 192).png().toFile("app/icon.png");
  await sharp(standard)
    .resize(180, 180)
    .flatten({ background: BLACK })
    .png()
    .toFile("app/apple-icon.png");

  console.log("Generated placeholder PWA icons in public/icons/, app/icon.png, app/apple-icon.png");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
