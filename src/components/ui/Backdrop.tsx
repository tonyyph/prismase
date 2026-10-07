import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '../../theme';

/** Deep navy base with two soft spectral light pools, as if light were passing through glass. */
export const Backdrop = memo(function Backdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="poolA" cx="18%" cy="12%" r="65%">
            <Stop offset="0" stopColor={colors.violet} stopOpacity="0.22" />
            <Stop offset="1" stopColor={colors.violet} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="poolB" cx="92%" cy="78%" r="60%">
            <Stop offset="0" stopColor={colors.cyan} stopOpacity="0.14" />
            <Stop offset="1" stopColor={colors.cyan} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="poolC" cx="70%" cy="30%" r="40%">
            <Stop offset="0" stopColor={colors.pink} stopOpacity="0.07" />
            <Stop offset="1" stopColor={colors.pink} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={colors.background} />
        <Rect width="100%" height="100%" fill="url(#poolA)" />
        <Rect width="100%" height="100%" fill="url(#poolB)" />
        <Rect width="100%" height="100%" fill="url(#poolC)" />
      </Svg>
    </View>
  );
});
