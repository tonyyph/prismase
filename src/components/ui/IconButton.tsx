import { StyleSheet } from 'react-native';

import { MIN_TOUCH, colors } from '../../theme';
import { WesternIcon, type WesternIconName } from '../art/WesternIcon';
import { ScalePressable } from './Pressable';
import { WoodTile } from './WoodTile';

type Props = {
  icon: WesternIconName;
  onPress: () => void;
  label: string;
  /** Glyph size. */
  size?: number;
  /** Square button size; defaults to a comfortable touch target. */
  box?: number;
};

export const IconButton = ({ icon, onPress, label, size = 24, box = MIN_TOUCH - 2 }: Props) => (
  <ScalePressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    hitSlop={6}
    style={{ width: box, height: box + 2 }}
  >
    <WoodTile style={styles.tile}>
      <WesternIcon name={icon} size={size} color={colors.textPrimary} />
    </WoodTile>
  </ScalePressable>
);

const styles = StyleSheet.create({
  tile: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
