import { isValidElement, type ReactElement, type ReactNode } from 'react';

/** Fonts in the app are registered under expo-google-fonts names; map them to real families. */
const FONT: Record<string, { family: string; weight?: number }> = {
  Rye_400Regular: { family: 'Rye' },
  PirataOne_400Regular: { family: 'Pirata One' },
  Bitter_500Medium: { family: 'Bitter', weight: 500 },
  Bitter_600SemiBold: { family: 'Bitter', weight: 600 },
  Bitter_700Bold: { family: 'Bitter', weight: 700 },
};

const kebab = (k: string) => k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
/** Attributes that keep their camelCase spelling in SVG. */
const KEEP = new Set(['viewBox', 'gradientUnits', 'gradientTransform', 'preserveAspectRatio']);
const esc = (v: unknown) =>
  String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const attrs = (props: Record<string, unknown>) => {
  const out: string[] = [];
  for (const [k, v] of Object.entries(props)) {
    if (k === 'children' || v === undefined || v === null || v === false) continue;
    if (typeof v === 'function' || typeof v === 'object') continue;
    if (k === 'fontFamily') {
      const f = FONT[String(v)];
      out.push(`font-family="${esc(f?.family ?? v)}"`);
      if (f?.weight) out.push(`font-weight="${f.weight}"`);
      continue;
    }
    if (k.startsWith('accessib')) continue;
    out.push(`${KEEP.has(k) ? k : kebab(k)}="${esc(v)}"`);
  }
  return out.length ? ` ${out.join(' ')}` : '';
};

type SvgNode = { $$svgTag: string; props: Record<string, unknown> & { children?: ReactNode } };

/** Serialises an element tree built from the app's art components into SVG markup. */
export const toSvg = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return esc(node);
  if (Array.isArray(node)) return node.map(toSvg).join('');
  if ((node as unknown as SvgNode).$$svgTag) {
    const { $$svgTag: name, props } = node as unknown as SvgNode;
    const xmlns = name === 'svg' ? ' xmlns="http://www.w3.org/2000/svg"' : '';
    return `<${name}${xmlns}${attrs(props)}>${toSvg(props.children)}</${name}>`;
  }
  if (isValidElement(node)) {
    const el = node as ReactElement<Record<string, unknown>>;
    let type: unknown = el.type;
    // memo() wraps the component; unwrap it.
    while (type && typeof type === 'object' && 'type' in (type as object)) {
      type = (type as { type: unknown }).type;
    }
    if (typeof type === 'symbol') return toSvg(el.props.children as ReactNode); // Fragment
    if (typeof type === 'function') return toSvg((type as (p: unknown) => ReactNode)(el.props));
  }
  return '';
};
