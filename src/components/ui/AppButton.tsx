import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { MIN_TOUCH, colors, glow, radius, spacing } from '../../theme';
import { AppText } from './AppText';
import { ScalePressable } from './Pressable';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Right-aligned extra, e.g. an ad badge or a coin cost. */
  accessory?: ReactNode;
  disabled?: boolean;
  compact?: boolean;
  accessibilityHint?: string;
};

export const AppButton = ({
  label,
  onPress,
  variant = 'secondary',
  icon,
  accessory,
  disabled,
  compact,
  accessibilityHint,
}: Props) => {
  const textColor = variant === 'primary' ? '#0B0F1A' : colors.textPrimary;
  const content = (
    <View style={[styles.row, compact && styles.compact]}>
      {icon ? <Ionicons name={icon} size={20} color={textColor} /> : null}
      <AppText variant="label" color={textColor} numberOfLines={1} style={styles.label}>
        {label}
      </AppText>
      {accessory}
    </View>
  );

  return (
    <ScalePressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={[
        styles.base,
        variant === 'secondary' && styles.secondary,
        variant === 'primary' && glow(colors.violet, 18, 0.45),
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={['#67E8F9', '#C4B5FD', '#F9A8D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </ScalePressable>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, minHeight: MIN_TOUCH + 6, justifyContent: 'center' },
  secondary: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.borderGlass,
  },
  gradient: { borderRadius: radius.lg, minHeight: MIN_TOUCH + 6, justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  compact: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  label: { flexShrink: 1 },
});
