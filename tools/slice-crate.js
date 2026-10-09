#!/usr/bin/env node
/**
 * Slices Tony's crate art (assets/brand/crate-source.png) vertically into a top cap (rail,
 * iron band, brass corners), a stretchable plank middle and a bottom cap, so crates of any
 * height keep true proportions. Caps scale with crate width. Run as part of `pnpm assets`.
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'crate');
const SRC = { w: 668, h: 2000 };
/** Visible bounds and where the caps end/begin, measured from the art. */
const X0 = 70;
const X1 = 600;
const TOP = [28, 240];
const MID = [240, 1680];
const BOTTOM = [1680, 1912];
/** Output width in px (@3x of an ~80 pt crate). */
const WIDTH = 240;

const href = `data:image/png;base64,${fs.readFileSync(path.join(ROOT, 'assets/brand/crate-source.png')).toString('base64')}`;
const scale = WIDTH / (X1 - X0);
fs.mkdirSync(OUT, { recursive: true });
for (const [name, [y0, y1]] of Object.entries({ top: TOP, mid: MID, bottom: BOTTOM })) {
  const h = y1 - y0;
  const outH = name === 'mid' ? 480 : Math.round(h * scale);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${X0} ${y0} ${X1 - X0} ${h}" width="${WIDTH}" height="${outH}" preserveAspectRatio="none"><image href="${href}" width="${SRC.w}" height="${SRC.h}"/></svg>`;
  fs.writeFileSync(
    path.join(OUT, `${name}.png`),
    new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng(),
  );
  console.log(`wrote assets/crate/${name}.png (${WIDTH}×${outH})`);
}
fs.writeFileSync(
  path.join(OUT, 'meta.json'),
  `${JSON.stringify(
    {
      // Cap heights as a fraction of crate width.
      top: (TOP[1] - TOP[0]) / (X1 - X0),
      bottom: (BOTTOM[1] - BOTTOM[0]) / (X1 - X0),
    },
    null,
    2,
  )}\n`,
);
