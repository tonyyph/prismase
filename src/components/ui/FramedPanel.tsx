import { type ReactNode, useState } from 'react';
import { Image, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import meta from '../../../assets/panel/meta.json';

const TOP = require('../../../assets/panel/top.png');
const MID = require('../../../assets/panel/mid.png');
const BOTTOM = require('../../../assets/panel/bottom.png');

/**
 * Tony's parchment panel in a stitched leather frame with brass corners and star crests,
 * vertically three-sliced so it grows with its content. Children sit on the parchment.
 */
export const FramedPanel = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) => {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const w = size?.w ?? 0;
  const top = Math.round(w * meta.top);
  const bottom = Math.round(w * meta.bottom);
  return (
    <View
      style={[
        styles.panel,
        // The parchment starts ~10% of the width in from the top and ~7% from the sides.
        w ? { paddingTop: w * 0.11, paddingBottom: w * 0.1, paddingHorizontal: w * 0.08 } : null,
        style,
      ]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize((p) =>
          p && Math.abs(p.w - width) < 0.5 && Math.abs(p.h - height) < 0.5
            ? p
            : { w: width, h: height },
        );
      }}
    >
      {size ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Image
            source={TOP}
            style={{ width: w, height: top }}
            resizeMode="stretch"
            fadeDuration={0}
          />
          {/* The middle overlaps both caps by a point so no hairline seam shows. */}
          <Image
            source={MID}
            style={{ width: w, height: size.h - top - bottom + 2, marginVertical: -1 }}
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
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
});
