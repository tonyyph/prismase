import { memo } from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';

import { f1, seeded, starPoints } from './geometry';

/** A hand-struck, slightly irregular gold coin with a star: the game's currency. */
const RIM = (() => {
  const r = seeded(11);
  let d = '';
  for (let i = 0; i < 28; i += 1) {
    const a = (i / 28) * Math.PI * 2;
    const rr = 46 * (0.94 + r() * 0.08);
    d += `${i ? 'L' : 'M'}${f1(50 + rr * Math.cos(a))} ${f1(50 + rr * Math.sin(a))} `;
  }
  return `${d}Z`;
})();

export const Doubloon = memo(function Doubloon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="gold" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor="#fff1b0" />
          <Stop offset="0.45" stopColor="#e9b83c" />
          <Stop offset="1" stopColor="#9a6416" />
        </LinearGradient>
      </Defs>
      <Path d={RIM} fill="url(#gold)" stroke="#6b4210" strokeWidth={3.2} strokeLinejoin="round" />
      <Circle
        cx={50}
        cy={50}
        r={33}
        fill="none"
        stroke="#8a5a14"
        strokeWidth={2.3}
        strokeDasharray="3.7 3.2"
      />
      <Polygon points={starPoints(50, 52, 23, 10)} fill="#8a5a14" />
      <Polygon points={starPoints(48.6, 50, 23, 10)} fill="#f6d77a" />
    </Svg>
  );
});
