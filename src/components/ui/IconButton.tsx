import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { MIN_TOUCH, colors } from '../../theme';
import { ScalePressable } from './Pressable';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  size?: number;
};

export const IconButton = ({ icon, onPress, label, size = 22 }: Props) => (
  <ScalePressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    hitSlop={6}
    style={styles.button}
  >
    <Ionicons name={icon} size={size} color={colors.textPrimary} />
  </ScalePressable>
);

const styles = StyleSheet.create({
  button: {
    width: MIN_TOUCH - 4,
    height: MIN_TOUCH - 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.borderGlass,
  },
});
