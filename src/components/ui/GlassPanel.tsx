import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../../theme';

type Props = { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean };

/** Frosted card: translucent fill, hairline border and a faint top sheen. */
export const GlassPanel = ({ children, style, padded = true }: Props) => (
  <View style={[styles.panel, padded && styles.padded, style]}>
    <LinearGradient
      pointerEvents="none"
      colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)']}
      style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]}
    />
    {children}
  </View>
);

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'rgba(18,24,39,0.82)',
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.borderGlass,
    ...shadows.card,
  },
  padded: { padding: spacing.xl },
});
