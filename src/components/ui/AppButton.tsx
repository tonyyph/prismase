import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  MIN_TOUCH,
  brickGradient,
  colors,
  fonts,
  plankGradient,
  radius,
  spacing,
} from '../../theme';
import { WesternIcon, type WesternIconName } from '../art/WesternIcon';
import { AppText } from './AppText';
import { ScalePressable } from './Pressable';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: WesternIconName;
  /** Right-aligned extra, e.g. an ad stamp or a coin cost. */
  accessory?: ReactNode;
  disabled?: boolean;
  compact?: boolean;
  accessibilityHint?: string;
};

const Nail = () => (
  <View style={styles.nail}>
    <View style={styles.nailShine} />
  </View>
);

/**
 * Primary: a brick-red painted plank in wood type. Secondary: a bare pine plank with
 * letterpress caps. Both are nailed on with brass tacks and sit on a hard drop edge.
 */
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
  const primary = variant === 'primary';
  const ghost = variant === 'ghost';
  const ink = primary || ghost ? colors.textPrimary : colors.ink;
  const content = (
    <View style={[styles.row, compact && styles.compact]}>
      {ghost || compact ? null : <Nail />}
      <View style={styles.center}>
        {icon ? <WesternIcon name={icon} size={20} color={ink} /> : null}
        <AppText
          variant="label"
          color={ink}
          numberOfLines={1}
          style={[styles.label, primary && styles.primaryLabel]}
        >
          {primary ? label : label.toUpperCase()}
        </AppText>
        {accessory}
      </View>
      {ghost || compact ? null : <Nail />}
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
      style={[styles.base, !ghost && [styles.edge, primary ? styles.edgeRed : styles.edgePine]]}
    >
      {ghost ? (
        content
      ) : (
        <LinearGradient
          colors={primary ? brickGradient : plankGradient}
          style={[styles.face, primary ? styles.faceRed : styles.facePine]}
        >
          <View pointerEvents="none" style={[styles.grain, { top: '30%' }]} />
          <View pointerEvents="none" style={[styles.grain, { top: '66%' }]} />
          {content}
        </LinearGradient>
      )}
    </ScalePressable>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: radius.sm + 2, minHeight: MIN_TOUCH + 6, justifyContent: 'center' },
  edge: { paddingBottom: 4 },
  edgeRed: { backgroundColor: '#5e1a0e' },
  edgePine: { backgroundColor: '#6b4421' },
  face: {
    borderRadius: radius.sm + 2,
    minHeight: MIN_TOUCH + 2,
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  faceRed: { borderColor: '#5e1a0e' },
  facePine: { borderColor: '#6b4421' },
  grain: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  compact: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  label: { flexShrink: 1 },
  primaryLabel: {
    fontFamily: fonts.western,
    fontSize: 19,
    lineHeight: 26,
    letterSpacing: 0.3,
    textShadowColor: '#4a1208',
    textShadowOffset: { width: 1.5, height: 2 },
    textShadowRadius: 0,
  },
  nail: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brassLight,
    borderWidth: 1,
    borderColor: colors.brassDark,
  },
  nailShine: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 2.5,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#fff6d8',
  },
});
