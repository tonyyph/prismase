import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import meta from '../../../assets/crate/meta.json';
import { colors } from '../../theme';
import { f1 } from './geometry';

const TOP = require('../../../assets/crate/top.png');
const MID = require('../../../assets/crate/mid.png');
const BOTTOM = require('../../../assets/crate/bottom.png');

type Props = {
  width: number;
  height: number;
  /** Kept for API compatibility; the painted art is the same for every crate. */
  seed?: number;
  /** Colour of a completed crate: its frame glows in that colour. */
  complete?: string;
  /** The bought extra crate is lashed with rope. */
  extra?: boolean;
};

/**
 * Tony's painted crate (rails, iron bands, brass corners, plank back), vertically
 * three-sliced so the caps keep their shape at any height. Drawn inside a 2 pt margin so the
 * outer box matches the old SVG crate (w + 4 by h + 4).
 */
export const CrateArt = memo(function CrateArt({ width: w, height: h, complete, extra }: Props) {
  const top = Math.round(w * meta.top);
  const bottom = Math.round(w * meta.bottom);
  return (
    <View style={{ width: w + 4, height: h + 4, padding: 2 }}>
      <View style={{ width: w, height: h }}>
        <Image
          source={TOP}
          style={{ width: w, height: top }}
          resizeMode="stretch"
          fadeDuration={0}
        />
        {/* The middle overlaps both caps by a point so no hairline seam shows. */}
        <Image
          source={MID}
          style={{ width: w, height: h - top - bottom + 2, marginVertical: -1 }}
          resizeMode="stretch"
          fadeDuration={0}
        />
        <Image
          source={BOTTOM}
          style={{ width: w, height: bottom }}
          resizeMode="stretch"
          fadeDuration={0}
        />
      </View>
      {complete ? (
        <View
          pointerEvents="none"
          style={[
            styles.glow,
            { borderColor: complete, shadowColor: complete, borderRadius: w * 0.08 },
          ]}
        />
      ) : null}
      {extra ? (
        <Svg width={w + 4} height={h + 4} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Path
            d={`M1 ${f1(h * 0.16)} L${w + 3} ${f1(h * 0.21)} M1 ${f1(h * 0.19)} L${w + 3} ${f1(h * 0.24)}`}
            stroke="#7a5a2c"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <Path
            d={`M1 ${f1(h * 0.16)} L${w + 3} ${f1(h * 0.21)} M1 ${f1(h * 0.19)} L${w + 3} ${f1(h * 0.24)}`}
            stroke={colors.rope}
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeDasharray="3 2"
          />
          <Circle
            cx={w * 0.78}
            cy={h * 0.22}
            r={w * 0.08}
            fill={colors.rope}
            stroke="#7a5a2c"
            strokeWidth={1.2}
          />
        </Svg>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  glow: {
    ...StyleSheet.absoluteFill,
    margin: 1,
    borderWidth: 2.5,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});

export { CrateMedallion } from './CrateMedallion';
