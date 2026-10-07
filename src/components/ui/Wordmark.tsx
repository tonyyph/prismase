import { memo } from 'react';
import Svg, { Defs, G, LinearGradient, Path, Stop, Text } from 'react-native-svg';

import { colors, fonts } from '../../theme';

/** "PRISMASE" in wood type: extruded rust shadow, ink outline, cream-to-gold face. */
export const Wordmark = memo(function Wordmark({ width = 300 }: { width?: number }) {
  const height = width * 0.27;
  const text = {
    x: '160',
    y: '62',
    textAnchor: 'middle' as const,
    fontFamily: fonts.western,
    fontSize: '54',
    letterSpacing: '1',
  };
  return (
    <Svg width={width} height={height} viewBox="0 0 320 86" accessibilityLabel="Prismase">
      <Defs>
        <LinearGradient id="face" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.1" stopColor="#fff6dc" />
          <Stop offset="1" stopColor="#f0c060" />
        </LinearGradient>
      </Defs>
      {[7, 6, 5, 4, 3, 2, 1].map((k) => (
        <Text key={k} {...text} x={`${160 + k * 0.8}`} y={`${62 + k}`} fill="#6a2a12">
          PRISMASE
        </Text>
      ))}
      <Text {...text} fill="none" stroke="#2b1208" strokeWidth={7} strokeLinejoin="round">
        PRISMASE
      </Text>
      <Text {...text} fill="url(#face)">
        PRISMASE
      </Text>
    </Svg>
  );
});

/** A red banner ribbon with notched tails, for the tagline under the wordmark. */
export const Ribbon = memo(function Ribbon({
  label,
  width = 240,
}: {
  label: string;
  width?: number;
}) {
  const w = 240;
  const h = 26;
  return (
    <Svg width={width} height={(width * 40) / 290} viewBox="-25 -4 290 40">
      <Path d={`M-18 6 L4 6 L4 ${h + 6} L-18 ${h + 6} L-9 ${h / 2 + 6} Z`} fill="#7e2414" />
      <Path
        d={`M${w + 18} 6 L${w - 4} 6 L${w - 4} ${h + 6} L${w + 18} ${h + 6} L${w + 9} ${h / 2 + 6} Z`}
        fill="#7e2414"
      />
      <Path
        d={`M4 ${h + 6} L12 ${h} H4 Z M${w - 4} ${h + 6} L${w - 12} ${h} H${w - 4} Z`}
        fill="#4a120a"
      />
      <G>
        <Path
          d={`M4 0 Q${w / 2} -6 ${w - 4} 0 V${h} Q${w / 2} ${h - 6} 4 ${h} Z`}
          fill={colors.brick}
          stroke="#5e1a0e"
          strokeWidth={1.2}
        />
        <Text
          x={w / 2}
          y={17}
          textAnchor="middle"
          fontFamily={fonts.slabBold}
          fontSize={12.5}
          letterSpacing={2.5}
          fill={colors.textPrimary}
        >
          {label}
        </Text>
      </G>
    </Svg>
  );
});
