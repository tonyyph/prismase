import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { MIN_TOUCH, colors, fonts, spacing } from '../../theme';
import { WesternIcon, type WesternIconName } from '../art/WesternIcon';
import { AppText } from './AppText';
import { PlankImage } from './PlankImage';
import { ScalePressable } from './Pressable';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  /** `hero` is the one big call to action on a screen. */
  size?: 'hero' | 'regular';
  icon?: WesternIconName;
  /** Right-aligned extra, e.g. an ad stamp or a coin cost. */
  accessory?: ReactNode;
  disabled?: boolean;
  compact?: boolean;
  accessibilityHint?: string;
};

/** Wood-type label with a dark ink outline and a cream-to-gold face, like a carved sign. */
const HeroLabel = ({ label }: { label: string }) => (
  <Svg width="100%" height={50}>
    <Defs>
      <LinearGradient id="heroFace" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0.15" stopColor="#fff6dc" />
        <Stop offset="1" stopColor="#f2c66a" />
      </LinearGradient>
    </Defs>
    {[
      { dy: 3, fill: '#2b0c04', stroke: '#2b0c04', sw: 7 },
      { dy: 0, fill: 'none', stroke: '#3a1206', sw: 6.5 },
      { dy: 0, fill: 'url(#heroFace)', stroke: 'none', sw: 0 },
    ].map((layer, i) => (
      <SvgText
        key={i}
        x="50%"
        y={37 + layer.dy}
        textAnchor="middle"
        fontFamily={fonts.western}
        fontSize={30}
        fill={layer.fill}
        stroke={layer.stroke}
        strokeWidth={layer.sw}
        strokeLinejoin="round"
      >
        {label}
      </SvgText>
    ))}
  </Svg>
);

/**
 * Primary: Tony's red-painted board in a brass frame, in wood type. Secondary: the bare pine
 * board, clearly quieter. Both are three-sliced art (see PlankImage) with a soft drop shadow.
 */
export const AppButton = ({
  label,
  onPress,
  variant = 'secondary',
  size = 'regular',
  icon,
  accessory,
  disabled,
  compact,
  accessibilityHint,
}: Props) => {
  const primary = variant === 'primary';
  const ghost = variant === 'ghost';
  const hero = size === 'hero' && primary;
  const ink = primary || ghost ? colors.textPrimary : colors.ink;

  const content = hero ? (
    <View style={styles.heroRow}>
      <HeroLabel label={label} />
    </View>
  ) : (
    <View style={[styles.row, compact && styles.compact]}>
      {/* Compact boards are too short to fit an icon between the rivets. */}
      {icon && !compact ? <WesternIcon name={icon} size={24} color={ink} /> : null}
      <AppText
        variant="label"
        color={ink}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[styles.label, primary && styles.primaryLabel]}
      >
        {primary ? label : label.toUpperCase()}
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
      style={[styles.base, !ghost && styles.shadow, hero && styles.hero]}
    >
      {ghost ? (
        content
      ) : (
        <PlankImage
          tone={primary ? 'red' : 'pine'}
          style={[styles.surface, hero && styles.heroSurface]}
        >
          {content}
        </PlankImage>
      )}
    </ScalePressable>
  );
};

const styles = StyleSheet.create({
  base: { minHeight: MIN_TOUCH + 6, justifyContent: 'center', borderRadius: 12 },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  hero: { borderRadius: 16 },
  surface: { minHeight: MIN_TOUCH + 10, justifyContent: 'center' },
  heroSurface: { minHeight: 72 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl + 14,
    paddingVertical: spacing.md,
  },
  heroRow: { paddingHorizontal: spacing.xl + 8, justifyContent: 'center' },
  compact: { paddingVertical: spacing.sm, paddingHorizontal: spacing.xl + 4 },
  label: { flexShrink: 1 },
  primaryLabel: {
    fontFamily: fonts.western,
    fontSize: 19,
    lineHeight: 26,
    letterSpacing: 0.3,
    textShadowColor: '#3a1206',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
});
