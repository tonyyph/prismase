#!/usr/bin/env node
/**
 * Three-slices Tony's button and chip art (assets/brand/button-*-source.png) into left cap, stretchable
 * middle and right cap, so buttons of any width keep round rivets and true bevels. Caps hold
 * the rivet and corner bevel; only the plain wood middle stretches. Run as part of `pnpm assets`.
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'buttons');
/** Output height in px (@3x of a ~60 pt button). */
const HEIGHT = 180;

/** Source size, visible bounds, and the cap width as a fraction of height. */
const SOURCES = {
  pine: { size: [2000, 667], box: [112, 146, 1886, 556], cap: 0.62 },
  red: { size: [2000, 667], box: [59, 107, 1938, 590], cap: 0.6 },
  // Single dark plank with four corner rivets: HUD chips and labels.
  chip: { size: [2000, 709], box: [226, 59, 1771, 614], cap: 0.5 },
  // Dark plank with one rivet each side: info labels (level · mode, level summary).
  label: { size: [2000, 709], box: [86, 66, 1911, 632], cap: 0.48 },
};

const slice = (name, { size, box, cap }) => {
  const src = fs.readFileSync(path.join(ROOT, 'assets', 'brand', `button-${name}-source.png`));
  const href = `data:image/png;base64,${src.toString('base64')}`;
  const [x0, y0, x1, y1] = box;
  const h = y1 - y0;
  const capW = Math.round(h * cap);
  const parts = {
    l: [x0, capW],
    m: [x0 + capW, x1 - x0 - capW * 2],
    r: [x1 - capW, capW],
  };
  for (const [part, [x, w]] of Object.entries(parts)) {
    const outW = Math.round((w * HEIGHT) / h);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y0} ${w} ${h}" width="${outW}" height="${HEIGHT}" preserveAspectRatio="none"><image href="${href}" width="${size[0]}" height="${size[1]}"/></svg>`;
    const png = new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng();
    fs.writeFileSync(path.join(OUT, `${name}-${part}.png`), png);
    console.log(`wrote assets/buttons/${name}-${part}.png (${outW}×${HEIGHT})`);
  }
  return { cap: capW / h };
};

fs.mkdirSync(OUT, { recursive: true });
const meta = Object.fromEntries(Object.entries(SOURCES).map(([n, s]) => [n, slice(n, s)]));
fs.writeFileSync(path.join(OUT, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
