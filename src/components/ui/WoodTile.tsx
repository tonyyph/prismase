import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

import { TileImage } from './TileImage';

/**
 * Tony's dark plank tile in a brass frame: icon buttons, action tiles, HUD chips.
 */
export const WoodTile = ({
  children,
  style,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) => <TileImage style={[styles.tile, style]}>{children}</TileImage>;

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: 11,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
});
