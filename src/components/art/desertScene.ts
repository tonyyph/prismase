import { mix } from '../../utils/color';
import { f1, seeded } from './geometry';

/**
 * The menu world as one SVG document: a white-hot noon sun with rays, mesas, dunes, a
 * pirate ship run aground in the sand, saguaros and a tumbleweed. Static, so it is built
 * once per screen size and drawn with SvgXml.
 */
const cactus = (x: number, base: number, hh: number, fill = '#5f7d3a') => {
  const wd = hh * 0.13;
  return `<g>
    <rect x="${f1(x - wd / 2)}" y="${f1(base - hh)}" width="${f1(wd)}" height="${f1(hh)}" rx="${f1(wd / 2)}" fill="${fill}"/>
    <path d="M${f1(x - wd / 2)} ${f1(base - hh * 0.45)} H${f1(x - hh * 0.26)} V${f1(base - hh * 0.75)}" stroke="${fill}" stroke-width="${f1(wd * 0.8)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M${f1(x + wd / 2)} ${f1(base - hh * 0.6)} H${f1(x + hh * 0.22)} V${f1(base - hh * 0.88)}" stroke="${fill}" stroke-width="${f1(wd * 0.8)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M${f1(x)} ${f1(base - hh + wd * 0.5)} V${f1(base)}" stroke="${mix(fill, '#ffffff', 0.25)}" stroke-width="1" opacity="0.7"/>
  </g>`;
};

const shipwreck = (
  x: number,
  y: number,
  s: number,
) => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(-9) scale(${f1(s * 100) / 100})">
  <path d="M52 0 L46 -82" stroke="#4a2a17" stroke-width="5" stroke-linecap="round"/>
  <path d="M30 -62 L66 -68" stroke="#4a2a17" stroke-width="3" stroke-linecap="round"/>
  <path d="M33 -60 L64 -66 L63 -30 L57 -37 L51 -28 L45 -35 L39 -26 L34 -33 Z" fill="#eadbb8" stroke="#a88c5e" stroke-width="1"/>
  <path d="M46 -82 L70 -78 L66 -71 L70 -66 L46 -70 Z" fill="#1e1a18"/>
  <circle cx="57" cy="-74.5" r="2.6" fill="#f4e6c6"/><path d="M53 -70.5 L61 -78.5 M53 -78.5 L61 -70.5" stroke="#f4e6c6" stroke-width="1.2"/>
  <path d="M96 -20 H126 L122 2 H98 Z" fill="#4a2a17" stroke="#2b170c" stroke-width="1.5"/>
  <rect x="102" y="-15" width="5" height="6" fill="#d9b779"/><rect x="111" y="-15" width="5" height="6" fill="#2b170c"/>
  <path d="M0 0 L124 0 L110 36 Q62 46 14 36 Z" fill="#5a3420" stroke="#2b170c" stroke-width="2"/>
  <path d="M4 10 H120 M8 20 H116 M12 29 H112" stroke="#2b170c" stroke-width="1.2" opacity="0.7"/>
  <path d="M40 14 l10 8 l-12 4 Z" fill="#2b170c"/>
</g>`;

export const desertSvg = (w: number, h: number, sunY = h * 0.1) => {
  const sx = w * 0.5;
  const rays = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const a2 = a + 0.07;
    const L = Math.max(w, h);
    return `<polygon points="${sx},${f1(sunY)} ${f1(sx + L * Math.cos(a))},${f1(sunY + L * Math.sin(a))} ${f1(sx + L * Math.cos(a2))},${f1(sunY + L * Math.sin(a2))}" fill="#fff8de" opacity="0.16"/>`;
  }).join('');
  const hz = h * 0.5;
  const P = (fx: number, fy: number) => `${f1(fx * w)} ${f1(hz - fy * h)}`;
  const r = seeded(4);
  const weed = Array.from(
    { length: 10 },
    (_, i) =>
      `<ellipse cx="0" cy="0" rx="${12 - (i % 3)}" ry="${9 + (i % 4)}" transform="rotate(${i * 18 + r() * 6})"/>`,
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb2d6"/><stop offset="0.6" stop-color="#cfe4e2"/><stop offset="1" stop-color="#f4e2b6"/></linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fffbe8" stop-opacity="1"/><stop offset="0.3" stop-color="#fff3c4" stop-opacity="0.7"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient>
    <linearGradient id="dune" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecc98c"/><stop offset="1" stop-color="#c98f4f"/></linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  ${rays}
  <circle cx="${sx}" cy="${f1(sunY)}" r="${f1(w * 0.42)}" fill="url(#halo)"/>
  <circle cx="${sx}" cy="${f1(sunY)}" r="${f1(w * 0.075)}" fill="#fffdf2"/>
  <path d="M${f1(w * 0.12)} ${f1(h * 0.2)} q6 -5 12 0 q6 -5 12 0 M${f1(w * 0.2)} ${f1(h * 0.16)} q4 -3.5 8 0 q4 -3.5 8 0" stroke="#3a2a20" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M0 ${f1(hz)} L${P(0, 0.05)} L${P(0.08, 0.05)} L${P(0.12, 0.08)} L${P(0.3, 0.08)} L${P(0.34, 0.035)} L${P(0.58, 0.035)} L${P(0.62, 0.1)} L${P(0.84, 0.1)} L${P(0.88, 0.04)} L${P(1, 0.04)} L${w} ${f1(hz)} Z" fill="#c9a08c" opacity="0.85"/>
  <path d="M0 ${f1(hz + h * 0.03)} L${P(0, 0.06)} L${P(0.04, 0.12)} L${P(0.2, 0.12)} L${P(0.24, 0.03)} L${P(0.7, 0.02)} L${P(0.74, 0.07)} L${P(0.86, 0.07)} L${P(0.9, 0)} L${P(1, -0.01)} L${w} ${f1(hz + h * 0.04)} Z" fill="#b5653d"/>
  <path d="M${P(0.04, 0.12)} L${P(0.2, 0.12)} L${P(0.205, 0.105)} L${P(0.035, 0.105)} Z M${P(0.74, 0.07)} L${P(0.86, 0.07)} L${P(0.865, 0.058)} L${P(0.735, 0.058)} Z" fill="#d38a58"/>
  <path d="M${P(0.07, 0.1)} V${f1(hz + h * 0.02)} M${P(0.13, 0.1)} V${f1(hz + h * 0.02)} M${P(0.78, 0.055)} V${f1(hz + h * 0.02)}" stroke="#9a4f2c" stroke-width="2" opacity="0.6"/>
  <path d="M0 ${f1(hz + h * 0.02)} Q${f1(w * 0.3)} ${f1(hz - h * 0.01)} ${f1(w * 0.55)} ${f1(hz + h * 0.03)} T${w} ${f1(hz + h * 0.01)} V${h} H0 Z" fill="url(#dune)"/>
  ${shipwreck(w * 0.6, hz + h * 0.065, w / 330)}
  <path d="M${f1(w * 0.45)} ${f1(hz + h * 0.1)} Q${f1(w * 0.75)} ${f1(hz + h * 0.04)} ${w} ${f1(hz + h * 0.09)} V${f1(hz + h * 0.14)} H${f1(w * 0.45)} Z" fill="#e2b877"/>
  ${cactus(w * 0.16, hz + h * 0.1, h * 0.12)}
  ${cactus(w * 0.9, hz + h * 0.06, h * 0.06, '#6d8a43')}
  <path d="M0 ${f1(h * 0.68)} Q${f1(w * 0.4)} ${f1(h * 0.63)} ${w} ${f1(h * 0.7)} V${h} H0 Z" fill="#d9a866"/>
  <path d="M0 ${f1(h * 0.68)} Q${f1(w * 0.4)} ${f1(h * 0.63)} ${w} ${f1(h * 0.7)}" stroke="#f0d3a0" stroke-width="2" fill="none"/>
  <g transform="translate(${f1(w * 0.86)} ${f1(h * 0.66)})" stroke="#8c6a3e" stroke-width="1.2" fill="none" opacity="0.9">${weed}</g>
</svg>`;
};
