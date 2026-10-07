/**
 * The Prismase mark (approved option A): a cowboy skull with two revolvers crossed under the
 * jaw, a frontier take on the Jolly Roger. One geometry, two consumers:
 *   - the app renders it with react-native-svg's SvgXml (src/components/ui/LogoMark.tsx),
 *   - tools/generate-assets.js renders it to the icon PNGs with resvg.
 * Plain CommonJS so the Node asset script can require it without a build step.
 * Change numbers here, run `pnpm assets`, and both stay in sync.
 */
const f1 = (n) => Math.round(n * 10) / 10;

const starPts = (cx, cy, ro, ri, n = 5) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = ((-90 + (i * 180) / n) * Math.PI) / 180;
    const r = i % 2 ? ri : ro;
    return `${f1(cx + r * Math.cos(a))},${f1(cy + r * Math.sin(a))}`;
  }).join(' ');

/** Barrel along +x from the cylinder at the origin; grip hangs down-left. `flip` mirrors it. */
const revolver = (
  x,
  y,
  rot,
  flip,
) => `<g transform="translate(${x} ${y}) scale(${flip} 1) rotate(${rot})">
  <rect x="-2" y="-3.2" width="48" height="6.4" rx="1.6" fill="#2b1a12"/><rect x="42" y="-5.4" width="3" height="2.4" fill="#2b1a12"/><path d="M4 -1 H44" stroke="#5a3a28" stroke-width="1"/>
  <rect x="-12" y="-6.5" width="15" height="13" rx="3" fill="#3a2418"/><circle cx="-4.5" cy="0" r="6.2" fill="#4a3122" stroke="#2b1a12" stroke-width="1"/>
  <path d="M-4.5 -4 V4 M-8 -2 L-1 2 M-8 2 L-1 -2" stroke="#2b1a12" stroke-width="0.8"/>
  <path d="M-12 4 L-20 22 Q-18 26 -11 25 L-3 7 Z" fill="#7a4a2a" stroke="#2b1a12" stroke-width="1"/>
  <path d="M-3 7 Q2 13 -6 13" stroke="#2b1a12" stroke-width="1.6" fill="none"/>
</g>`;

const sunburst = (n, c1, c2) => {
  let o = `<rect width="100" height="100" fill="${c1}"/>`;
  for (let i = 0; i < n; i += 2) {
    const a = (i / n) * Math.PI * 2;
    const b = ((i + 1) / n) * Math.PI * 2;
    o += `<polygon points="50,55 ${f1(50 + 90 * Math.cos(a))},${f1(55 + 90 * Math.sin(a))} ${f1(50 + 90 * Math.cos(b))},${f1(55 + 90 * Math.sin(b))}" fill="${c2}"/>`;
  }
  return o;
};

/** Skull, revolvers and hat only, on a transparent 100×100 box. */
const outlawFigure = (mono = false) => {
  const ink = '#2b1a12';
  if (mono) {
    // Android themed icon: a flat white silhouette; eyes and nose are cut out with a mask so
    // they stay transparent (the launcher tints by alpha).
    const guns = revolver(-2, 0, -28, 1) + revolver(2, 0, -28, -1);
    const white = guns.replace(/(fill|stroke)="#[0-9a-f]{6}"/gi, '$1="#fff"');
    return `<defs><mask id="cut"><rect width="100" height="100" fill="#fff"/><ellipse cx="42" cy="53" rx="6" ry="6.6" fill="#000"/><ellipse cx="58" cy="53" rx="6" ry="6.6" fill="#000"/><path d="M50 58 L46.5 64.5 H53.5 Z" fill="#000"/><path d="M17 39 Q50 51 83 39" stroke="#000" stroke-width="2.4" fill="none"/></mask></defs>
<g mask="url(#cut)" fill="#fff">
  <g transform="translate(50 82) scale(0.72)">${white}</g>
  <path d="M31 55 Q29 31 50 30 Q71 31 69 55 Q69 63 62 65 V73 H38 V65 Q31 63 31 55 Z"/>
  <path d="M17 39 Q50 51 83 39 Q86 43 80 47 Q50 59 20 47 Q14 43 17 39 Z"/>
  <path d="M31 42 Q29 21 39 15 Q50 21 61 15 Q71 21 69 42 Q50 46 31 42 Z"/>
</g>`;
  }
  return `<defs><linearGradient id="skull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf0d6"/><stop offset="1" stop-color="#d9c49a"/></linearGradient></defs>
<path d="M31 55 Q29 31 50 30 Q71 31 69 55 Q69 63 62 65 V73 H38 V65 Q31 63 31 55 Z" fill="url(#skull)" stroke="${ink}" stroke-width="1.6"/>
<ellipse cx="42" cy="53" rx="6" ry="6.6" fill="${ink}"/><ellipse cx="58" cy="53" rx="6" ry="6.6" fill="${ink}"/>
<path d="M50 58 L46.5 64.5 H53.5 Z" fill="${ink}"/><path d="M43 68 V73 M47 68 V73 M51 68 V73 M55 68 V73" stroke="${ink}" stroke-width="1.3"/>
<g transform="translate(50 82) scale(0.72)">${revolver(-2, 0, -28, 1)}${revolver(2, 0, -28, -1)}</g>
<path d="M17 39 Q50 51 83 39 Q86 43 80 47 Q50 59 20 47 Q14 43 17 39 Z" fill="#6b3b1f" stroke="${ink}" stroke-width="1.6"/>
<path d="M31 42 Q29 21 39 15 Q50 21 61 15 Q71 21 69 42 Q50 46 31 42 Z" fill="#7e4524" stroke="${ink}" stroke-width="1.6"/>
<path d="M31 36 Q50 40 69 36 L69 41 Q50 45 31 41 Z" fill="${ink}"/>
<polygon points="${starPts(50, 38.8, 3.6, 1.5)}" fill="#f3d27a"/>
<path d="M40 19 Q45 21 48 19" stroke="#a8653a" stroke-width="1.2" fill="none"/>`;
};

const backdrop =
  () => `<defs><radialGradient id="shade" cx="0.5" cy="0.55" r="0.7"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a0e05" stop-opacity="0.55"/></radialGradient></defs>
${sunburst(28, '#b8432b', '#c9583a')}<rect width="100" height="100" fill="url(#shade)"/>`;

/**
 * Full SVG document.
 * kind: 'icon' (sunburst + figure), 'figure' (transparent), 'background' (sunburst only),
 * 'mono' (white silhouette). `inset` shrinks the figure toward the centre (adaptive icons).
 */
const outlawMarkSvg = (kind = 'figure', { size = 100, inset = 1 } = {}) => {
  const figure = kind === 'background' ? '' : outlawFigure(kind === 'mono');
  const scaled =
    inset === 1
      ? figure
      : `<g transform="translate(${f1(50 - 50 * inset)} ${f1(50 - 50 * inset)}) scale(${inset})">${figure}</g>`;
  const bg = kind === 'icon' || kind === 'background' ? backdrop() : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">${bg}${scaled}</svg>`;
};

module.exports = { outlawMarkSvg };
