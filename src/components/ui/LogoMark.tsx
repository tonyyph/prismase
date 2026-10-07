import { memo } from 'react';
import { SvgXml } from 'react-native-svg';

import { outlawMarkSvg } from '../../brand/outlawMark';

const FIGURE = outlawMarkSvg('figure');

/** The outlaw mark (cowboy skull, crossed revolvers). Same SVG the app icon is rendered from. */
export const LogoMark = memo(function LogoMark({ size = 72 }: { size?: number }) {
  return <SvgXml xml={FIGURE} width={size} height={size} />;
});
