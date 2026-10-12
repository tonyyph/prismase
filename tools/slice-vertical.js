#!/usr/bin/env node
/**
 * Vertically three-slices tall framed art (top cap, stretchable middle, bottom cap) so it fits
 * any height without distorting its ornaments. Writes <out>/{top,mid,bottom}.png and a
 * meta.json with cap heights as a fraction of width. Run as part of `pnpm assets`.
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.join(__dirname, '..');

const JOBS = [
  // Settings panel: leather frame, brass corners and star crests top and bottom, parchment.
  {
    src: 'assets/brand/settings-panel-source.png',
    size: [1137, 1383],
    out: 'assets/panel',
    x: [5, 1116],
    top: [0, 250],
    bottom: [1130, 1364],
    width: 900,
  },
];

for (const job of JOBS) {
  const href = `data:image/png;base64,${fs.readFileSync(path.join(ROOT, job.src)).toString('base64')}`;
  const [x0, x1] = job.x;
  const scale = job.width / (x1 - x0);
  const out = path.join(ROOT, job.out);
  fs.mkdirSync(out, { recursive: true });
  const parts = { top: job.top, mid: [job.top[1], job.bottom[0]], bottom: job.bottom };
  for (const [name, [y0, y1]] of Object.entries(parts)) {
    const h = y1 - y0;
    const outH = Math.round(h * scale);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${x1 - x0} ${h}" width="${job.width}" height="${outH}" preserveAspectRatio="none"><image href="${href}" width="${job.size[0]}" height="${job.size[1]}"/></svg>`;
    fs.writeFileSync(
      path.join(out, `${name}.png`),
      new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng(),
    );
    console.log(`wrote ${job.out}/${name}.png (${job.width}×${outH})`);
  }
  fs.writeFileSync(
    path.join(out, 'meta.json'),
    `${JSON.stringify({ top: (job.top[1] - job.top[0]) / (x1 - x0), bottom: (job.bottom[1] - job.bottom[0]) / (x1 - x0) }, null, 2)}\n`,
  );
}
