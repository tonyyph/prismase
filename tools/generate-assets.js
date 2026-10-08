#!/usr/bin/env node
/**
 * Builds every brand asset from one source picture, assets/brand/outlaw-source.png (the
 * cowboy-skull art Tony supplied), plus the sunburst backdrop in src/brand/outlawMark.js.
 * Run with `pnpm assets`. To change the mark, replace the source PNG and re-run; never
 * hand-edit the outputs.
 *
 * Outputs:
 *   assets/brand/outlaw-mark.png         trimmed, square, cleaned figure for the in-app hero
 *   assets/icon.png                      iOS icon (figure on the sunburst), RGB, no alpha
 *   assets/android-icon-*.png            adaptive icon layers and the themed mono layer
 *   assets/splash-icon.png, favicon.png
 *
 * The source has near-opaque alpha (about 250/255) inside the figure, as AI-generated art often
 * does; it is snapped to fully opaque so the mark never looks washed out over a background.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Resvg } = require('@resvg/resvg-js');

const { outlawMarkSvg } = require('../src/brand/outlawMark.js');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');
const SOURCE = path.join(ASSETS, 'brand', 'outlaw-source.png');

// ---- PNG encoding -------------------------------------------------------------------------

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

/**
 * Encodes resvg's premultiplied RGBA. `opaque` writes RGB composited over black (only used for
 * images that are opaque anyway); otherwise straight (un-premultiplied) RGBA.
 */
const encodePng = ({ width, height, pixels }, opaque) => {
  const ch = opaque ? 3 : 4;
  const raw = Buffer.alloc(height * (width * ch + 1));
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * ch + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const a = pixels[i + 3];
      const o = row + 1 + x * ch;
      for (let c = 0; c < 3; c += 1) {
        raw[o + c] = opaque
          ? pixels[i + c]
          : a
            ? Math.min(255, Math.round((pixels[i + c] * 255) / a))
            : 0;
      }
      if (!opaque) raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = opaque ? 2 : 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const render = (svg, size) => {
  const img = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render();
  return { width: img.width, height: img.height, pixels: Buffer.from(img.pixels) };
};

const dataUri = (png) => `data:image/png;base64,${png.toString('base64')}`;

const write = (name, img, opaque) => {
  fs.writeFileSync(path.join(ASSETS, name), encodePng(img, opaque));
  console.log(`wrote assets/${name} (${img.width}px, ${opaque ? 'RGB' : 'RGBA'})`);
};

// ---- 1. Clean, trimmed figure -------------------------------------------------------------

const sourceUri = dataUri(fs.readFileSync(SOURCE));
const SRC = 1254;
const full = render(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SRC}" height="${SRC}"><image href="${sourceUri}" width="${SRC}" height="${SRC}"/></svg>`,
  SRC,
);

// Bounding box of the visible figure.
let minX = SRC;
let minY = SRC;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < SRC; y += 1) {
  for (let x = 0; x < SRC; x += 1) {
    if (full.pixels[(y * SRC + x) * 4 + 3] > 20) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
}
// Square crop around the figure with a small margin so nothing touches the edge.
const side = Math.round(Math.max(maxX - minX, maxY - minY) * 1.04);
const cx = (minX + maxX) / 2;
const cy = (minY + maxY) / 2;
const MARK = 768;
const mark = render(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cx - side / 2} ${cy - side / 2} ${side} ${side}" width="${MARK}" height="${MARK}"><image href="${sourceUri}" width="${SRC}" height="${SRC}"/></svg>`,
  MARK,
);
// Snap near-opaque pixels to opaque (premultiplied: scale colour with alpha).
for (let i = 0; i < mark.pixels.length; i += 4) {
  const a = mark.pixels[i + 3];
  if (a >= 200 && a < 255) {
    for (let c = 0; c < 3; c += 1) {
      mark.pixels[i + c] = Math.min(255, Math.round((mark.pixels[i + c] * 255) / a));
    }
    mark.pixels[i + 3] = 255;
  }
}
fs.mkdirSync(path.join(ASSETS, 'brand'), { recursive: true });
write('brand/outlaw-mark.png', mark, false);
const markUri = dataUri(encodePng(mark, false));

// ---- 2. Monochrome silhouette for Android themed icons ------------------------------------

/**
 * Themed icons are tinted by alpha only, so the mark becomes white shapes. The dark ink
 * outlines, eye sockets and hat band drop out (luminance below the cut), which keeps the
 * skull, hat and fists readable as cut-paper shapes instead of a single blob.
 */
const mono = { width: MARK, height: MARK, pixels: Buffer.alloc(mark.pixels.length) };
for (let i = 0; i < mark.pixels.length; i += 4) {
  const a = mark.pixels[i + 3];
  if (!a) continue;
  const [r, g, b] = [0, 1, 2].map((c) => (mark.pixels[i + c] * 255) / a);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const keep = Math.max(0, Math.min(1, (lum - 62) / 12));
  const out = Math.round(a * keep);
  mono.pixels[i] = out;
  mono.pixels[i + 1] = out;
  mono.pixels[i + 2] = out;
  mono.pixels[i + 3] = out;
}
const monoUri = dataUri(encodePng(mono, false));

// ---- 3. Icons -----------------------------------------------------------------------------

fs.mkdirSync(ASSETS, { recursive: true });
write('icon.png', render(outlawMarkSvg({ figureHref: markUri, scale: 0.84, dy: 2 }), 1024), true);
write('favicon.png', render(outlawMarkSvg({ figureHref: markUri, scale: 0.9, dy: 2 }), 48), true);
write('android-icon-background.png', render(outlawMarkSvg(), 1024), true);
// Adaptive icons are masked to roughly the centre 66%; keep the figure inside that.
write(
  'android-icon-foreground.png',
  render(outlawMarkSvg({ backdrop: false, figureHref: markUri, scale: 0.6 }), 1024),
  false,
);
write(
  'android-icon-monochrome.png',
  render(outlawMarkSvg({ backdrop: false, figureHref: monoUri, scale: 0.6 }), 1024),
  false,
);
write(
  'splash-icon.png',
  render(outlawMarkSvg({ backdrop: false, figureHref: markUri, scale: 1 }), 512),
  false,
);
