import { memo } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { getPrismColor } from '../../game/constants';
import { darken, lighten } from '../../utils/color';
import { Emblem } from '../art/Emblem';
import { f1, scallopPath } from '../art/geometry';

type Props = { colorId: string; size: number };

const RIM = scallopPath(50, 50, 48, 3.2, 18);
const BEADS = Array.from({ length: 18 }, (_, i) => {
  const a = (i * Math.PI) / 9 + 0.17;
  return [f1(50 + 42.3 * Math.cos(a)), f1(50 + 42.3 * Math.sin(a))] as const;
});

/**
 * One playing piece: a scalloped brass concho with an enamel face and a carved emblem.
 * Colour and emblem always travel together, so pieces never rely on hue alone.
 */
export const PrismItem = memo(function PrismItem({ colorId, size }: Props) {
  const color = getPrismColor(colorId);
  const c = color.base;
  const carving = color.inkEmblem ? '#2b1a10' : '#fbefd5';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#f7dd8c" />
          <Stop offset="0.5" stopColor="#cc9a34" />
          <Stop offset="1" stopColor="#7a4f14" />
        </LinearGradient>
        <RadialGradient id="enamel" cx="0.38" cy="0.32" r="0.78">
          <Stop offset="0" stopColor={lighten(c, 0.32)} />
          <Stop offset="0.55" stopColor={c} />
          <Stop offset="1" stopColor={darken(c, 0.38)} />
        </RadialGradient>
      </Defs>
      <Path d={RIM} fill="url(#rim)" stroke="#4a2a0e" strokeWidth={1.6} />
      {BEADS.map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} fill="#6b4214" opacity={0.65} />
      ))}
      <Circle cx={50} cy={50} r={38.6} fill="#5a3510" />
      <Circle
        cx={50}
        cy={50}
        r={36.6}
        fill="url(#enamel)"
        stroke={darken(c, 0.55)}
        strokeWidth={1.2}
      />
      <G transform="translate(10 10) scale(0.8)">
        {color.inkEmblem ? null : (
          <G transform="translate(1.6 2.2)" opacity={0.4}>
            <Emblem name={color.icon} fill="#000" accent="#000" />
          </G>
        )}
        <Emblem name={color.icon} fill={carving} accent={c} />
      </G>
      <Path
        d="M22 42 A30 30 0 0 1 56 16"
        stroke="#ffffff"
        strokeOpacity={0.35}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
});
