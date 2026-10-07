import { memo } from 'react';
import Svg, { Defs, LinearGradient, Stop, Text } from 'react-native-svg';

import { fonts } from '../../theme';

/** "Prismase" set in Sora with a spectral fill. */
export const Wordmark = memo(function Wordmark({ width = 280 }: { width?: number }) {
  const height = width * 0.25;
  return (
    <Svg width={width} height={height} viewBox="0 0 280 70" accessibilityLabel="Prismase">
      <Defs>
        <LinearGradient id="wm" x1="0" y1="0" x2="1" y2="0.4">
          <Stop offset="0" stopColor="#A5F3FC" />
          <Stop offset="0.5" stopColor="#DDD6FE" />
          <Stop offset="1" stopColor="#FBCFE8" />
        </LinearGradient>
      </Defs>
      <Text
        x="140"
        y="52"
        textAnchor="middle"
        fontFamily={fonts.display}
        fontSize="50"
        letterSpacing="-1"
        fill="url(#wm)"
      >
        Prismase
      </Text>
    </Svg>
  );
});
