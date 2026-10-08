import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

import { PlankImage } from './PlankImage';

/**
 * Tony's single dark plank with four corner rivets, for wide HUD chips and labels (daily
 * reward, doubloon count, level tag). Square buttons use WoodTile instead. Content must keep
 * clear of the rivets, so the default padding is about half the chip's height per side.
 */
export const WoodChip = ({
  children,
  style,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <PlankImage tone="chip" style={[styles.chip, style]}>
    {children}
  </PlankImage>
);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
});
