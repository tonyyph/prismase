import { StyleSheet } from 'react-native';

import { MIN_TOUCH, colors } from '../../theme';
import { WesternIcon, type WesternIconName } from '../art/WesternIcon';
import { ScalePressable } from './Pressable';
import { WoodTile } from './WoodTile';

type Props = {
  icon: WesternIconName;
  onPress: () => void;
  label: string;
  size?: number;
};

export const IconButton = ({ icon, onPress, label, size = 24 }: Props) => (
  <ScalePressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    hitSlop={6}
    style={styles.button}
  >
    <WoodTile style={styles.tile}>
      <WesternIcon name={icon} size={size} color={colors.textPrimary} />
    </WoodTile>
  </ScalePressable>
);

const styles = StyleSheet.create({
  button: { width: MIN_TOUCH - 2, height: MIN_TOUCH },
  tile: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
