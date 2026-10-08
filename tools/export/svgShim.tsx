/**
 * Stand-in for react-native-svg when exporting art in Node: every component becomes a plain
 * SVG tag, so the app's own art components can be serialised to SVG strings and rendered
 * with resvg. Used only by tools/export-art (bundled by esbuild).
 */
import type { ReactNode } from 'react';

type Props = Record<string, unknown> & { children?: ReactNode };
const tag = (name: string) => {
  const C = (props: Props) => ({ $$svgTag: name, props });
  C.displayName = name;
  return C;
};

const Svg = tag('svg');
export default Svg;
export const G = tag('g');
export const Path = tag('path');
export const Circle = tag('circle');
export const Ellipse = tag('ellipse');
export const Rect = tag('rect');
export const Polygon = tag('polygon');
export const Text = tag('text');
export const Defs = tag('defs');
export const LinearGradient = tag('linearGradient');
export const RadialGradient = tag('radialGradient');
export const Stop = tag('stop');
export const SvgXml = () => null;
