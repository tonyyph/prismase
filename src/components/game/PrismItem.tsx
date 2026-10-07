import { memo } from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { getPrismColor } from '../../game/constants';

type Props = { colorId: string; size: number };

/**
 * One crystal. Each colour has a fixed cut (gem, orb or shard) so that similar hues still read
 * differently, which matters for colour-blind players.
 */
export const PrismItem = memo(function PrismItem({ colorId, size }: Props) {
  const color = getPrismColor(colorId);
  const id = `g-${color.id}`;

  if (color.variant === 'orb') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={id} cx="38%" cy="32%" r="70%">
            <Stop offset="0" stopColor={color.light} />
            <Stop offset="0.5" stopColor={color.base} />
            <Stop offset="1" stopColor={color.dark} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="44" fill={`url(#${id})`} />
        <Circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke={color.light}
          strokeOpacity={0.35}
          strokeWidth={2}
        />
        <Ellipse
          cx="37"
          cy="30"
          rx="15"
          ry="9"
          fill="#FFFFFF"
          opacity={0.6}
          transform="rotate(-25 37 30)"
        />
        <Circle cx="66" cy="70" r="5" fill="#FFFFFF" opacity={0.18} />
      </Svg>
    );
  }

  if (color.variant === 'shard') {
    // An isometric crystal: lit top face, mid left face, shaded right face.
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color.base} />
            <Stop offset="1" stopColor={color.dark} />
          </LinearGradient>
        </Defs>
        <Polygon points="50,5 90,27 50,49 10,27" fill={color.light} />
        <Polygon points="10,27 50,49 50,95 10,73" fill={color.base} />
        <Polygon points="90,27 50,49 50,95 90,73" fill={`url(#${id})`} />
        <Polygon
          points="50,5 90,27 90,73 50,95 10,73 10,27"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.35}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <Path d="M22 30 L50 14 L58 18 L30 34 Z" fill="#FFFFFF" opacity={0.45} />
      </Svg>
    );
  }

  // Gem: a brilliant cut seen from the side, crown on top and pavilion below.
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={id} x1="0.1" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor={color.light} />
          <Stop offset="0.45" stopColor={color.base} />
          <Stop offset="1" stopColor={color.dark} />
        </LinearGradient>
      </Defs>
      <Polygon points="28,10 72,10 94,36 50,93 6,36" fill={`url(#${id})`} strokeLinejoin="round" />
      <Polygon points="28,10 72,10 94,36 6,36" fill="#FFFFFF" opacity={0.2} />
      <Path
        d="M6 36 H94 M28 10 L38 36 L50 93 L62 36 L72 10 M50 10 L38 36 M50 10 L62 36"
        stroke="#FFFFFF"
        strokeOpacity={0.35}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
      />
      <Polygon points="30,14 46,14 38,32 14,34" fill="#FFFFFF" opacity={0.5} />
    </Svg>
  );
});
