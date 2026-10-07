import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useState } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors, radius, shadows, spacing } from '../../theme';
import { f1, seeded } from '../art/geometry';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  /** 'wood' for signs and settings boards, 'parchment' for posters and notes. */
  material?: 'wood' | 'parchment';
};

/** A ragged paper outline for a w×h sheet. */
const tornPath = (w: number, h: number, seed: number) => {
  const r = seeded(seed);
  const steps = Math.max(8, Math.round(w / 22));
  const vsteps = Math.max(8, Math.round(h / 22));
  let d = 'M0 0';
  for (let i = 1; i <= steps; i += 1) d += ` L${f1((w * i) / steps)} ${f1((r() - 0.5) * 5)}`;
  for (let i = 1; i <= vsteps; i += 1) d += ` L${f1(w + (r() - 0.5) * 5)} ${f1((h * i) / vsteps)}`;
  for (let i = steps - 1; i >= 0; i -= 1)
    d += ` L${f1((w * i) / steps)} ${f1(h + (r() - 0.5) * 6)}`;
  for (let i = vsteps - 1; i > 0; i -= 1) d += ` L${f1((r() - 0.5) * 5)} ${f1((h * i) / vsteps)}`;
  return `${d} Z`;
};

const Parchment = ({ width, height }: { width: number; height: number }) => (
  <Svg width={width + 8} height={height + 10} style={styles.paperSvg}>
    <Defs>
      <RadialGradient id="paper" cx="0.5" cy="0.45" r="0.75">
        <Stop offset="0" stopColor="#f3e2b6" />
        <Stop offset="0.75" stopColor="#e2c48a" />
        <Stop offset="1" stopColor="#b98f52" />
      </RadialGradient>
    </Defs>
    <Path d={tornPath(width, height, 9)} fill="#000" opacity={0.4} transform="translate(4 6)" />
    <Path d={tornPath(width, height, 9)} fill="url(#paper)" stroke="#8a6a3a" strokeWidth={1} />
    <Rect
      x={12}
      y={12}
      width={width - 24}
      height={height - 24}
      fill="none"
      stroke={colors.ink}
      strokeWidth={2}
    />
    <Rect
      x={16}
      y={16}
      width={width - 32}
      height={height - 32}
      fill="none"
      stroke={colors.ink}
      strokeWidth={0.8}
    />
  </Svg>
);

/**
 * The game's two surfaces. Wood: a stained board with brass tacks in the corners.
 * Parchment: a torn, double-ruled wanted-poster sheet pinned with iron tacks.
 * (Kept the GlassPanel name so callers did not churn when the theme changed.)
 */
export const GlassPanel = ({ children, style, padded = true, material = 'wood' }: Props) => {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  if (material === 'parchment') {
    return (
      <View
        style={[styles.paper, padded && styles.paperPad, style]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setSize((s) => (s && s.width === width && s.height === height ? s : { width, height }));
        }}
      >
        {size ? <Parchment width={size.width} height={size.height} /> : null}
        {(['l', 'r'] as const).map((side) => (
          <View key={side} style={[styles.tack, side === 'l' ? { left: 6 } : { right: 6 }]} />
        ))}
        {children}
      </View>
    );
  }
  return (
    <View style={[styles.woodEdge, style]}>
      <LinearGradient
        colors={['#a06a3a', '#6e4223']}
        style={[styles.wood, padded && styles.woodPad]}
      >
        <View pointerEvents="none" style={styles.inset} />
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <View
            key={c}
            pointerEvents="none"
            style={[
              styles.brassTack,
              c[0] === 't' ? { top: 8 } : { bottom: 8 },
              c[1] === 'l' ? { left: 8 } : { right: 8 },
            ]}
          />
        ))}
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  woodEdge: {
    borderRadius: radius.md,
    backgroundColor: '#2e180b',
    paddingBottom: 6,
    ...shadows.card,
  },
  wood: { borderRadius: radius.md, borderWidth: 2, borderColor: '#3a1f0e' },
  woodPad: { padding: spacing.xl },
  inset: {
    ...StyleSheet.absoluteFill,
    margin: 5,
    borderRadius: radius.md - 4,
    borderWidth: 1,
    borderColor: 'rgba(43,23,12,0.45)',
  },
  brassTack: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.brassLight,
    borderWidth: 1,
    borderColor: colors.brassDark,
  },
  paper: {},
  paperPad: { paddingHorizontal: spacing.xl + 6, paddingVertical: spacing.xl + 8 },
  paperSvg: { position: 'absolute', left: 0, top: 0 },
  tack: {
    position: 'absolute',
    top: 4,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#5a5450',
    borderWidth: 1,
    borderColor: '#2a2522',
  },
});
