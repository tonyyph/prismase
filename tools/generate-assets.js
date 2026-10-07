#!/usr/bin/env node
/**
 * Renders the app icon, Android adaptive icon layers, splash mark and favicon from the same
 * six-facet crystal geometry as src/components/ui/LogoMark.tsx. Run with `pnpm assets`.
 * Change the numbers here and re-run; never hand-edit the PNGs.
 *
 * Opaque outputs (icon, Android background, favicon) are RGB with no alpha channel, because
 * App Store review rejects icons that carry one.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ASSETS = path.join(__dirname, '..', 'assets');
const hex = (v) => [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);

const BG = hex('#070A12');
const BG2 = hex('#141A33');
const GLOW = [hex('#A78BFA'), hex('#22D3EE')];
const FACETS = ['#22D3EE', '#3B82F6', '#A78BFA', '#F472B6', '#FBBF24', '#34D399'].map(hex);
const WHITE = [1, 1, 1];

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
const encodePng = (size, px, alpha) => {
  const ch = alpha ? 4 : 3;
  const raw = Buffer.alloc(size * (size * ch + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * ch + 1)] = 0;
    for (let x = 0; x < size; x += 1) {
      for (let c = 0; c < ch; c += 1) {
        raw[y * (size * ch + 1) + 1 + x * ch + c] = Math.round(
          Math.max(0, Math.min(1, px[(y * size + x) * 4 + c])) * 255,
        );
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = alpha ? 6 : 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

// ---- Drawing ------------------------------------------------------------------------------

const canvas = (size) => ({ size, px: new Float32Array(size * size * 4) });

const blend = (cv, x, y, rgb, a) => {
  if (a <= 0) return;
  const i = (y * cv.size + x) * 4;
  const p = cv.px;
  const outA = a + p[i + 3] * (1 - a);
  for (let c = 0; c < 3; c += 1) {
    p[i + c] = outA ? (rgb[c] * a + p[i + c] * p[i + 3] * (1 - a)) / outA : 0;
  }
  p[i + 3] = outA;
};

const mixRgb = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

const background = (cv) => {
  const { size } = cv;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const base = mixRgb(BG2, BG, Math.min(1, (y / size) * 1.1));
      const d = Math.hypot(x / size - 0.5, y / size - 0.5);
      const g = Math.max(0, 1 - d / 0.5) ** 2 * 0.32;
      const tint = mixRgb(GLOW[0], GLOW[1], x / size);
      blend(cv, x, y, mixRgb(base, tint, g), 1);
    }
  }
};

const hexPoint = (i, r, cx, cy) => {
  const a = (Math.PI / 3) * i - Math.PI / 2;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

const sign = (p, a, b) => (p[0] - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (p[1] - b[1]);
const inTriangle = (p, a, b, c) => {
  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};

const segDist = (p, a, b) => {
  const [vx, vy] = [b[0] - a[0], b[1] - a[1]];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vy * t);
};

const SS = 4; // supersampling per axis

/**
 * Draws the crystal: `extent` is its diameter as a fraction of the canvas.
 * `mono` paints a white silhouette (Android themed icon). `seams` is the facet gap colour.
 */
const crystal = (cv, extent, { mono = false, glow = true, seams = BG } = {}) => {
  const { size } = cv;
  const c = size / 2;
  const R = (size * extent) / 2;
  const unit = R / 46; // LogoMark draws r = 46 in a 100 box
  const verts = Array.from({ length: 7 }, (_, i) => hexPoint(i, R, c, c));
  const center = [c, c];
  const hl = [hexPoint(5, R * (30 / 46), c, c), hexPoint(0, R * (30 / 46), c, c), center];

  if (glow && !mono) {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const d = Math.hypot(x - c, y - c) / R;
        if (d < 1.6) blend(cv, x, y, mixRgb(GLOW[0], GLOW[1], x / size), Math.max(0, 1 - d / 1.6) ** 2 * 0.35);
      }
    }
  }

  const x0 = Math.floor(c - R - 2);
  const x1 = Math.ceil(c + R + 2);
  for (let y = x0; y < x1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const acc = [0, 0, 0];
      let cover = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const p = [x + (sx + 0.5) / SS, y + (sy + 0.5) / SS];
          let facet = -1;
          for (let i = 0; i < 6; i += 1) {
            if (inTriangle(p, center, verts[i], verts[i + 1])) {
              facet = i;
              break;
            }
          }
          if (facet < 0) continue;
          let rgb;
          let seam = false;
          for (let i = 0; i < 6; i += 1) {
            if (segDist(p, center, verts[i]) < unit * 0.9) seam = true;
          }
          if (mono) {
            rgb = WHITE;
            if (seam) continue;
          } else if (seam) {
            rgb = seams;
          } else {
            // Same gradient as LogoMark: white sheen at the top-left fading into the facet colour.
            const t = ((p[0] - (c - R)) + (p[1] - (c - R))) / (4 * R);
            const base = FACETS[facet];
            rgb = t < 0.45 ? mixRgb(base, WHITE, 0.55 * (1 - t / 0.45)) : mixRgb(base, [0, 0, 0], ((t - 0.45) / 0.55) * 0.25);
            if (inTriangle(p, ...hl)) rgb = mixRgb(rgb, WHITE, 0.28);
          }
          acc[0] += rgb[0];
          acc[1] += rgb[1];
          acc[2] += rgb[2];
          cover += 1;
        }
      }
      if (cover) blend(cv, x, y, acc.map((v) => v / cover), cover / (SS * SS));
    }
  }
};

const write = (name, cv, alpha) => {
  fs.writeFileSync(path.join(ASSETS, name), encodePng(cv.size, cv.px, alpha));
  console.log(`wrote assets/${name} (${cv.size}px, ${alpha ? 'RGBA' : 'RGB'})`);
};
const render = (size, draw) => {
  const cv = canvas(size);
  draw(cv);
  return cv;
};

fs.mkdirSync(ASSETS, { recursive: true });
write('icon.png', render(1024, (cv) => (background(cv), crystal(cv, 0.6))), false);
write('favicon.png', render(48, (cv) => (background(cv), crystal(cv, 0.8, { glow: false }))), false);
write('android-icon-background.png', render(1024, background), false);
// Adaptive icons are masked to roughly the centre 66%; keep the mark well inside it.
write('android-icon-foreground.png', render(1024, (cv) => crystal(cv, 0.42)), true);
write('android-icon-monochrome.png', render(1024, (cv) => crystal(cv, 0.42, { mono: true })), true);
write('splash-icon.png', render(512, (cv) => crystal(cv, 0.8, { glow: false })), true);
