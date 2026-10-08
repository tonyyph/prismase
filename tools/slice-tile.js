#!/usr/bin/env node
/**
 * Nine-slices Tony's small wooden tile (assets/brand/tile-source.png) into corners, edges and
 * a centre, so square buttons and wide HUD chips alike keep a true brass frame and chamfered
 * corners. Run as part of `pnpm assets`.
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'tile');
/** Visible bounds in the 1367×1151 source and the corner size (covers frame + chamfer). */
const BOX = [95, 35, 1265, 1118];
const CORNER = 300;
/** Output scale: a 300 px corner becomes 90 px (30 pt at @3x). */
const SCALE = 0.3;

const src = fs.readFileSync(path.join(ROOT, 'assets', 'brand', 'tile-source.png'));
const href = `data:image/png;base64,${src.toString('base64')}`;
const [x0, y0, x1, y1] = BOX;
const cols = [
  [x0, CORNER],
  [x0 + CORNER, x1 - x0 - 2 * CORNER],
  [x1 - CORNER, CORNER],
];
const rows = [
  [y0, CORNER],
  [y0 + CORNER, y1 - y0 - 2 * CORNER],
  [y1 - CORNER, CORNER],
];
const names = [
  ['tl', 't', 'tr'],
  ['l', 'c', 'r'],
  ['bl', 'b', 'br'],
];

fs.mkdirSync(OUT, { recursive: true });
rows.forEach(([y, h], ri) =>
  cols.forEach(([x, w], ci) => {
    const ow = Math.round(w * SCALE);
    const oh = Math.round(h * SCALE);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${ow}" height="${oh}" preserveAspectRatio="none"><image href="${href}" width="1367" height="1151"/></svg>`;
    const png = new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng();
    fs.writeFileSync(path.join(OUT, `${names[ri][ci]}.png`), png);
  }),
);
console.log('wrote assets/tile/*.png (9 slices)');
