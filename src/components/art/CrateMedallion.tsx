import { memo } from 'react';
import Svg, { Circle, Polygon } from 'react-native-svg';

import { colors } from '../../theme';
import { starPoints } from './geometry';

/** The sheriff medallion that hangs over a completed crate, in that crate's colour. */
export const CrateMedallion = memo(function CrateMedallion({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={18} fill={color} stroke={colors.brassDark} strokeWidth={2.4} />
      <Circle cx={20} cy={20} r={14} fill="none" stroke={colors.brassLight} strokeWidth={1.4} />
      <Polygon points={starPoints(20, 20.5, 10.5, 4.4)} fill={colors.textPrimary} />
    </Svg>
  );
});
