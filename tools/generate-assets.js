#!/usr/bin/env node
/**
 * Renders the app icon, Android adaptive layers, splash mark and favicon from the approved
 * outlaw mark in src/brand/outlawMark.js (the same SVG the app draws), using resvg.
 * Run with `pnpm assets`. Change the mark there and re-run; never hand-edit the PNGs.
 *
 * Opaque outputs (icon, Android background, favicon) are written as RGB with no alpha
 * channel, because App Store review rejects icons that carry one.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Resvg } = require('@resvg/resvg-js');

const { outlawMarkSvg } = require('../src/brand/outlawMark.js');

const ASSETS = path.join(__dirname, '..', 'assets');

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

/** Encodes RGBA pixels as an RGB PNG, compositing over `matte` (opaque images only). */
const encodeRgb = (width, height, rgba, matte = [0, 0, 0]) => {
  const raw = Buffer.alloc(height * (width * 3 + 1));
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 3 + 1)] = 0;
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const a = rgba[i + 3] / 255;
      for (let c = 0; c < 3; c += 1) {
        raw[y * (width * 3 + 1) + 1 + x * 3 + c] = Math.round(rgba[i + c] * a + matte[c] * (1 - a));
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const render = (svg, size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render();

const write = (name, svg, size, opaque) => {
  const img = render(svg, size);
  const png = opaque ? encodeRgb(img.width, img.height, img.pixels) : img.asPng();
  fs.writeFileSync(path.join(ASSETS, name), png);
  console.log(`wrote assets/${name} (${img.width}px, ${opaque ? 'RGB' : 'RGBA'})`);
};

fs.mkdirSync(ASSETS, { recursive: true });
write('icon.png', outlawMarkSvg('icon'), 1024, true);
write('favicon.png', outlawMarkSvg('icon'), 48, true);
write('android-icon-background.png', outlawMarkSvg('background'), 1024, true);
// Adaptive icons are masked to roughly the centre 66%; shrink the figure to stay inside it.
write('android-icon-foreground.png', outlawMarkSvg('figure', { inset: 0.6 }), 1024, false);
write('android-icon-monochrome.png', outlawMarkSvg('mono', { inset: 0.6 }), 1024, false);
write('splash-icon.png', outlawMarkSvg('figure'), 512, false);
