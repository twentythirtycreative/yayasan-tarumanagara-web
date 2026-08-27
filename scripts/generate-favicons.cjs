// Regenerate the whole favicon set from one source mark.
// Usage: npm run favicons
//
// Why this exists instead of re-running realfavicongenerator: its output shipped
// a WHITE mark on transparency in every file except favicon-96x96.png. Google
// reads /favicon.ico, so the SERP showed a white blob on a white plate, and the
// iOS home-screen icon had the same problem. Everything here carries its own
// black plate, so the mark reads on any background it lands on.
//
// Source of truth: scripts/assets/logo-mark.png — the white mark on
// transparency, 1024px, no plate. Kept out of /public because it is a build
// input, not something the site serves.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(__dirname, "assets/logo-mark.png");
const OUT = path.join(ROOT, "public/favicon");
const PLATE = "#000000";

/** The mark, sized to `px`, transparent around it. */
const mark = (px) =>
  sharp(SRC)
    .resize(px, px, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

/**
 * Round icon: black disc, transparent corners, mark at 80% — the framing the
 * one good asset in the old set (favicon-96x96.png) already used, so tabs keep
 * the look they have today.
 */
async function disc(size) {
  const inner = Math.round(size * 0.8);
  const plate = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${PLATE}"/></svg>`,
  );
  return sharp(plate)
    .composite([{ input: await mark(inner), gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Square icon: black edge to edge, mark at 60%. Full-bleed because these two
 * land under someone else's mask — iOS rounds the home-screen icon itself, and
 * a `purpose: "maskable"` manifest icon gets cropped to a circle of 80% of the
 * edge. Transparent corners would show the wallpaper through; 60% keeps the
 * mark inside the crop.
 */
async function square(size) {
  const inner = Math.round(size * 0.6);
  return sharp({
    create: { width: size, height: size, channels: 4, background: PLATE },
  })
    .composite([{ input: await mark(inner), gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * ICO container holding PNG entries. Written by hand because sharp has no ICO
 * encoder; PNG-in-ICO is read by every browser that matters and by Google.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const dir = [];
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size; // width  (0 means 256)
    e[1] = size >= 256 ? 0 : size; // height
    e[2] = 0; // palette size
    e[3] = 0; // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    dir.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...dir, ...images.map((i) => i.data)]);
}

/**
 * Theme-aware SVG: black disc in a light UI, the bare white mark in a dark one,
 * where a black disc would sink into the browser chrome. Two embedded 512px
 * rasters — the mark has no vector source, and the previous build embedded two
 * 5258px ones, which is how a favicon reached 7.6 MB.
 */
async function themedSvg() {
  const light = (await disc(512)).toString("base64");
  const dark = (await mark(512)).toString("base64");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <style>
    #light { display: inline }
    #dark { display: none }
    @media (prefers-color-scheme: dark) {
      #light { display: none }
      #dark { display: inline }
    }
  </style>
  <image id="light" width="512" height="512" href="data:image/png;base64,${light}"/>
  <image id="dark" width="512" height="512" href="data:image/png;base64,${dark}"/>
</svg>
`;
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

(async () => {
  const write = (file, data) => {
    fs.writeFileSync(file, data);
    console.log(`  ${path.relative(ROOT, file).replace(/\\/g, "/")} — ${kb(data.length)}`);
  };

  console.log("Ikon bulat (disc hitam + logo putih):");
  const icoBuf = ico([
    { size: 16, data: await disc(16) },
    { size: 32, data: await disc(32) },
    { size: 48, data: await disc(48) },
  ]);
  // Two copies on purpose: Next serves /favicon.ico from the app/ convention
  // (that is the one Google fetches), and the generator package keeps its own.
  write(path.join(ROOT, "src/app/favicon.ico"), icoBuf);
  write(path.join(OUT, "favicon.ico"), icoBuf);
  write(path.join(OUT, "favicon-96x96.png"), await disc(96));

  console.log("Ikon persegi (full-bleed, untuk mask pihak lain):");
  write(path.join(OUT, "apple-touch-icon.png"), await square(180));
  write(path.join(OUT, "web-app-manifest-192x192.png"), await square(192));
  write(path.join(OUT, "web-app-manifest-512x512.png"), await square(512));

  console.log("SVG adaptif:");
  write(path.join(OUT, "favicon.svg"), Buffer.from(await themedSvg(), "utf8"));
})().catch((e) => {
  console.error("❌ Gagal:", e.message);
  process.exit(1);
});
