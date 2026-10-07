import { memo } from 'react';
import Svg, { Defs, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';

/**
 * The Prismase mark: a hexagonal crystal split into six spectral facets. The same geometry is
 * rendered into the app icon by tools/generate-assets.js.
 */
export const FACETS = ['#22D3EE', '#3B82F6', '#A78BFA', '#F472B6', '#FBBF24', '#34D399'];

const hexPoint = (i: number, r: number, c = 50) => {
  const a = (Math.PI / 3) * i - Math.PI / 2;
  return [c + r * Math.cos(a), c + r * Math.sin(a)] as const;
};

export const LogoMark = memo(function LogoMark({ size = 72 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {FACETS.map((color, i) => (
          <LinearGradient key={color} id={`f${i}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
            <Stop offset="0.45" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.75" />
          </LinearGradient>
        ))}
      </Defs>
      {FACETS.map((_, i) => {
        const [x1, y1] = hexPoint(i, 46);
        const [x2, y2] = hexPoint(i + 1, 46);
        return (
          <Polygon
            key={i}
            points={`50,50 ${x1},${y1} ${x2},${y2}`}
            fill={`url(#f${i})`}
            stroke="#070A12"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        );
      })}
      <Path
        d={`M${hexPoint(5, 30).join(',')} L${hexPoint(0, 30).join(',')} L50,50 Z`}
        fill="#FFFFFF"
        opacity={0.28}
      />
    </Svg>
  );
});
