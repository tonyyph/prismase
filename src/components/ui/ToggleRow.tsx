import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, View } from 'react-native';

import { haptic } from '../../hooks/useHaptics';
import { MIN_TOUCH, colors, spacing } from '../../theme';
import { AppText } from './AppText';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export const ToggleRow = ({ icon, label, description, value, onChange }: Props) => (
  <View style={styles.row} accessibilityRole="switch" accessibilityState={{ checked: value }}>
    <View style={styles.icon}>
      <Ionicons name={icon} size={20} color={colors.cyan} />
    </View>
    <View style={styles.text}>
      <AppText variant="label">{label}</AppText>
      {description ? (
        <AppText variant="caption" color={colors.textSecondary}>
          {description}
        </AppText>
      ) : null}
    </View>
    <Switch
      value={value}
      accessibilityLabel={label}
      onValueChange={(next) => {
        haptic('tap');
        onChange(next);
      }}
      trackColor={{ false: 'rgba(148,163,184,0.3)', true: colors.violet }}
      thumbColor={colors.textPrimary}
      ios_backgroundColor="rgba(148,163,184,0.3)"
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: MIN_TOUCH + 8,
    paddingVertical: spacing.sm,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(34,211,238,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
});
