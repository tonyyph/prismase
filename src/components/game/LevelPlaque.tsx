import { Image, StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { colors, fonts } from '../../theme';
import { starPoints } from '../art/geometry';
import { AppText } from '../ui/AppText';

/** Tony's hanging sign (ropes, brass frame, four rivets), trimmed to 780 × 365. */
const SIGN = require('../../../assets/brand/level-sign.png');
export const SIGN_RATIO = 365 / 780;
/** Where the board itself starts below the rope loops, as a fraction of the sign height. */
export const SIGN_BOARD_TOP = 0.116;
/** Rope centres as fractions of the sign width (measured from the art). */
export const SIGN_ROPES = [0.152, 0.852] as const;

const Star = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20">
    <Polygon points={starPoints(10, 10.5, 9.5, 4)} fill={colors.brassLight} />
  </Svg>
);

/**
 * "★ Level 2 ★" over "EASY · 0 MOVES" on the hanging wooden sign. Text sits inside the
 * board, clear of the rope loops and rivets; it scales with the sign.
 */
export const LevelPlaque = ({
  level,
  detail,
  width,
}: {
  level: number;
  detail: string;
  width: number;
}) => {
  const height = width * SIGN_RATIO;
  const titleSize = Math.max(17, Math.min(26, width * 0.11));
  return (
    <View
      style={{ width, height }}
      accessible
      accessibilityRole="header"
      accessibilityLabel={`Level ${level}, ${detail}`}
    >
      <Image
        source={SIGN}
        style={[styles.image, { width, height }]}
        resizeMode="stretch"
        fadeDuration={0}
      />
      <View
        style={[
          styles.content,
          { top: height * 0.24, bottom: height * 0.12, left: width * 0.13, right: width * 0.13 },
        ]}
      >
        <View style={styles.titleRow}>
          <Star size={titleSize * 0.5} />
          <AppText
            variant="title"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.32 }]}
          >
            Level {level}
          </AppText>
          <Star size={titleSize * 0.5} />
        </View>
        <View style={styles.rule} />
        <AppText
          variant="caption"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={styles.detail}
        >
          {detail}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: { position: 'absolute', left: 0, top: 0 },
  content: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '100%' },
  title: {
    fontFamily: fonts.western,
    flexShrink: 1,
    textShadowColor: '#1e0702',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  rule: {
    alignSelf: 'stretch',
    height: 1,
    marginHorizontal: 10,
    marginVertical: 2,
    backgroundColor: colors.brass,
    opacity: 0.75,
  },
  detail: { color: colors.textSecondary, letterSpacing: 1.6 },
});
