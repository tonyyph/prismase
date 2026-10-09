import { StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { colors, fonts, spacing } from '../../theme';
import { starPoints } from '../art/geometry';
import { AppText } from '../ui/AppText';
import { PlankImage } from '../ui/PlankImage';

const Star = () => (
  <Svg width={12} height={12} viewBox="0 0 20 20">
    <Polygon points={starPoints(10, 10.5, 9.5, 4)} fill={colors.brassLight} />
  </Svg>
);

/** A short rope loop the sign hangs from. */
const Rope = () => (
  <View style={styles.rope}>
    <View style={styles.ropeCore} />
  </View>
);

/**
 * The level title on a two-rivet plank hung from two short ropes: "★ Level 2 ★" in wood type
 * over a brass rule, with difficulty and move count beneath.
 */
export const LevelPlaque = ({ level, detail }: { level: number; detail: string }) => (
  <View style={styles.wrap} accessible accessibilityLabel={`Level ${level}, ${detail}`}>
    <View style={styles.ropes} pointerEvents="none">
      <Rope />
      <Rope />
    </View>
    <PlankImage tone="label" style={styles.plank}>
      <View style={styles.titleRow}>
        <Star />
        <AppText
          variant="title"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          style={styles.title}
        >
          Level {level}
        </AppText>
        <Star />
      </View>
      <View style={styles.rule} />
      <AppText variant="caption" numberOfLines={1} style={styles.detail}>
        {detail}
      </AppText>
    </PlankImage>
  </View>
);

const styles = StyleSheet.create({
  wrap: { flex: 1, maxWidth: 220, alignSelf: 'center', paddingTop: 8 },
  ropes: {
    position: 'absolute',
    top: -6,
    left: '24%',
    right: '24%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  rope: {
    width: 7,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#7a5a2c',
    backgroundColor: colors.rope,
    alignItems: 'center',
  },
  ropeCore: { width: 1, height: '100%', backgroundColor: '#7a5a2c', opacity: 0.6 },
  plank: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  title: {
    fontFamily: fonts.western,
    fontSize: 22,
    lineHeight: 29,
    flexShrink: 1,
    textShadowColor: '#1e0702',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  rule: {
    alignSelf: 'stretch',
    height: 1,
    marginHorizontal: 6,
    backgroundColor: colors.brass,
    opacity: 0.7,
  },
  detail: { color: colors.textSecondary, marginTop: 1, letterSpacing: 1.6 },
});
