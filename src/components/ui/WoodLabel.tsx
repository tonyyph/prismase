import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

import { PlankImage } from './PlankImage';

/**
 * Tony's dark plank with a rivet each side, for read-only info labels such as
 * "LEVEL 2 · EASY". Content keeps clear of the rivets via horizontal padding.
 */
export const WoodLabel = ({
  children,
  style,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <PlankImage tone="label" style={[styles.label, style]}>
    {children}
  </PlankImage>
);

const styles = StyleSheet.create({
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
    height: 36,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
});
