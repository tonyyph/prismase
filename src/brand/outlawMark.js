/**
 * Brand mark backdrop. The figure itself (cowboy skull, hat, crossed revolvers in gloved fists)
 * is raster art supplied by Tony: assets/brand/outlaw-source.png. tools/generate-assets.js
 * composites it over this sunburst for the app icon and trims it for the in-app hero
 * (assets/brand/outlaw-mark.png). Plain CommonJS so the Node asset script can require it.
 */
const f1 = (n) => Math.round(n * 10) / 10;

const sunburst = (n, c1, c2) => {
  let o = `<rect width="100" height="100" fill="${c1}"/>`;
  for (let i = 0; i < n; i += 2) {
    const a = (i / n) * Math.PI * 2;
    const b = ((i + 1) / n) * Math.PI * 2;
    o += `<polygon points="50,55 ${f1(50 + 90 * Math.cos(a))},${f1(55 + 90 * Math.sin(a))} ${f1(50 + 90 * Math.cos(b))},${f1(55 + 90 * Math.sin(b))}" fill="${c2}"/>`;
  }
  return o;
};

/** Brick-red sunburst with a soft dark vignette, as an SVG fragment in a 100 box. */
const backdropFragment =
  () => `<defs><radialGradient id="shade" cx="0.5" cy="0.55" r="0.7"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a0e05" stop-opacity="0.55"/></radialGradient></defs>
${sunburst(28, '#b8432b', '#c9583a')}<rect width="100" height="100" fill="url(#shade)"/>`;

/**
 * Full SVG document. With `figureHref` (a data: URI of the PNG), the figure is placed centred
 * at `scale` of the box (0.8 = 80%), nudged down by `dy` percent. Without a backdrop the
 * result is transparent around the figure.
 */
const outlawMarkSvg = ({ backdrop = true, figureHref, scale = 0.8, dy = 0, size = 100 } = {}) => {
  const s = f1(100 * scale);
  const xy = f1((100 - s) / 2);
  const figure = figureHref
    ? `<image href="${figureHref}" x="${xy}" y="${f1(Number(xy) + dy)}" width="${s}" height="${s}"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">${backdrop ? backdropFragment() : ''}${figure}</svg>`;
};

module.exports = { outlawMarkSvg };
