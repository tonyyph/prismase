import fs from 'fs';
import path from 'path';

import { outlawMarkSvg } from '../../../brand/outlawMark';
import { PRISM_COLORS } from '../../../game/constants';

const ROOT = path.join(__dirname, '../../../..');

/** Hue in degrees and saturation 0..1 of a hex colour. */
const hsv = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
};

it('gives every colour its own painted piece', () => {
  expect(new Set(PRISM_COLORS.map((c) => c.id)).size).toBe(PRISM_COLORS.length);
  for (const c of PRISM_COLORS) {
    expect(fs.existsSync(path.join(ROOT, 'assets/pieces', `${c.id}.png`))).toBe(true);
  }
});

it('keeps every pair of colours visibly apart', () => {
  // Players tell pieces apart mainly by enamel colour, so no two may share a hue and shade.
  for (let i = 0; i < PRISM_COLORS.length; i += 1) {
    for (let j = i + 1; j < PRISM_COLORS.length; j += 1) {
      const a = hsv(PRISM_COLORS[i].base);
      const b = hsv(PRISM_COLORS[j].base);
      const dh = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h));
      const far = dh >= 18 || Math.abs(a.v - b.v) >= 0.25 || Math.abs(a.s - b.s) >= 0.35;
      expect({ pair: [PRISM_COLORS[i].id, PRISM_COLORS[j].id], far }).toEqual({
        pair: [PRISM_COLORS[i].id, PRISM_COLORS[j].id],
        far: true,
      });
    }
  }
});

it('composes the icon backdrop with and without the figure', () => {
  const plain = outlawMarkSvg();
  expect(plain.startsWith('<svg')).toBe(true);
  expect(plain).not.toContain('<image');
  const withFigure = outlawMarkSvg({ figureHref: 'data:image/png;base64,AAAA', scale: 0.8 });
  expect(withFigure).toContain(
    '<image href="data:image/png;base64,AAAA" x="10" y="10" width="80" height="80"/>',
  );
});
