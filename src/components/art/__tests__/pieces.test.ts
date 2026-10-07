import { outlawMarkSvg } from '../../../brand/outlawMark';
import { PRISM_COLORS } from '../../../game/constants';

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

it('gives every colour its own emblem and its own enamel', () => {
  expect(new Set(PRISM_COLORS.map((c) => c.icon)).size).toBe(PRISM_COLORS.length);
  expect(new Set(PRISM_COLORS.map((c) => c.base.toUpperCase())).size).toBe(PRISM_COLORS.length);
});

it('keeps the frontier/pirate mix at mostly cowboy', () => {
  const pirate = PRISM_COLORS.filter((c) => c.pirate).length;
  expect(pirate).toBeGreaterThan(0);
  expect(pirate).toBeLessThanOrEqual(PRISM_COLORS.length / 3);
});

it.each(PRISM_COLORS.map((c) => [c.name, c] as const))(
  '%s emblem stands out from its enamel',
  (_name, c) => {
    const carving = c.inkEmblem ? '#2b1a10' : '#fbefd5';
    expect(contrast(carving, c.base)).toBeGreaterThanOrEqual(3);
  },
);

it('renders every outlaw mark variant as a complete SVG document', () => {
  for (const kind of ['icon', 'figure', 'background', 'mono'] as const) {
    const svg = outlawMarkSvg(kind);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
  }
  expect(outlawMarkSvg('mono')).toContain('mask="url(#cut)"');
});
