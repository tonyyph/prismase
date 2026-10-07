import { StyleSheet, Switch, View } from 'react-native';

import { haptic } from '../../hooks/useHaptics';
import { MIN_TOUCH, colors, spacing } from '../../theme';
import { WesternIcon, type WesternIconName } from '../art/WesternIcon';
import { AppText } from './AppText';

type Props = {
  icon: WesternIconName;
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export const ToggleRow = ({ icon, label, description, value, onChange }: Props) => (
  <View style={styles.row} accessibilityRole="switch" accessibilityState={{ checked: value }}>
    <View style={styles.icon}>
      <WesternIcon name={icon} size={22} color={colors.ink} />
    </View>
    <View style={styles.text}>
      <AppText variant="heading" color={colors.textPrimary}>
        {label}
      </AppText>
      {description ? (
        <AppText variant="body" color={colors.textSecondary} style={styles.desc}>
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
      trackColor={{ false: '#4a2a17', true: colors.brick }}
      thumbColor={colors.parchment}
      ios_backgroundColor="#4a2a17"
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.parchment,
    borderWidth: 1.5,
    borderColor: colors.brassDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 1 },
  desc: { fontSize: 14, lineHeight: 19 },
});
