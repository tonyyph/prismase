#!/usr/bin/env node
/**
 * Cuts Tony's toggle art (assets/brand/switch-source.png: ON on the left, OFF on the right)
 * into an ON track, an OFF track and a round knob, so WesternSwitch can slide the knob and
 * reveal the red track behind it. Run as part of `pnpm assets`.
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'switch');
const href = `data:image/png;base64,${fs.readFileSync(path.join(ROOT, 'assets/brand/switch-source.png')).toString('base64')}`;
const SCALE = 0.3;

const cut = (vx, vy, w, h, name, round = false) => {
  const clip = round
    ? `<defs><clipPath id="c"><circle cx="${vx + w / 2}" cy="${vy + h / 2}" r="${w / 2}"/></clipPath></defs><g clip-path="url(#c)">`
    : '<g>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${w} ${h}" width="${Math.round(w * SCALE)}" height="${Math.round(h * SCALE)}">${clip}<image href="${href}" width="2000" height="667"/></g></svg>`;
  fs.writeFileSync(
    path.join(OUT, `${name}.png`),
    new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng(),
  );
  console.log(`wrote assets/switch/${name}.png`);
};

/**
 * A track with its painted knob removed: the switch is symmetric, so the half without the
 * knob is kept and mirrored onto the other half. `keep` is the clean side.
 */
const track = (vx, vy, w, h, name, keep) => {
  const mid = vx + w / 2;
  const img = `<image href="${href}" width="2000" height="667"/>`;
  const x = keep === 'left' ? vx : mid;
  // The mirrored copy goes underneath, whole, so the clean half's edge leaves no seam.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${w} ${h}" width="${Math.round(w * SCALE)}" height="${Math.round(h * SCALE)}"><defs><clipPath id="k"><rect x="${x}" y="${vy}" width="${w / 2}" height="${h}"/></clipPath></defs><g transform="translate(${2 * mid} 0) scale(-1 1)">${img}</g><g clip-path="url(#k)">${img}</g></svg>`;
  fs.writeFileSync(
    path.join(OUT, `${name}.png`),
    new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng(),
  );
  console.log(`wrote assets/switch/${name}.png`);
};

fs.mkdirSync(OUT, { recursive: true });
// Both tracks share one 870 × 380 frame; knob centres are at x 762 (ON) and 1240 (OFF), y 317.
track(72, 128, 870, 380, 'on', 'left');
track(1058, 128, 870, 380, 'off', 'right');
cut(762 - 129, 317 - 129, 258, 258, 'knob', true);
