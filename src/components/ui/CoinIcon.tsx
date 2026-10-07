import { memo } from 'react';
import Svg, { Circle, Defs, LinearGradient, Polygon, Stop } from 'react-native-svg';

/** A prism coin: amber disc with a small faceted gem. */
export const CoinIcon = memo(function CoinIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Defs>
        <LinearGradient id="coin" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FEF3C7" />
          <Stop offset="0.5" stopColor="#FBBF24" />
          <Stop offset="1" stopColor="#B45309" />
        </LinearGradient>
      </Defs>
      <Circle cx="10" cy="10" r="9" fill="url(#coin)" />
      <Circle
        cx="10"
        cy="10"
        r="6.6"
        fill="none"
        stroke="#FFFBEB"
        strokeOpacity={0.55}
        strokeWidth={1}
      />
      <Polygon points="10,5.6 13.6,9 10,14.4 6.4,9" fill="#FFFBEB" opacity={0.9} />
    </Svg>
  );
});
