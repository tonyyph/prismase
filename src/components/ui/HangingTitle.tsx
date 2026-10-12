import { Image, StyleSheet, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

import { colors, fonts } from '../../theme';
import { starPoints } from '../art/geometry';
import { AppText } from './AppText';

/** The same hanging sign as the level title (Tony's art, 780 × 365). */
const SIGN = require('../../../assets/brand/level-sign.png');
const RATIO = 365 / 780;
const ROPES = [0.152, 0.852];

/** Finished title signs painted with their lettering (Tony's art), keyed by title. */
type Painted = {
  source: number;
  ratio: number;
  /** A plain stretch of both ropes from the top of the art, repeated up off the screen. */
  ropeTile: number;
  ropeTileRatio: number;
};
const PAINTED: Record<string, Painted> = {
  // 840 × 524, braided ropes running from the top edge down to the board (46% down).
  Settings: {
    source: require('../../../assets/brand/settings-sign.png'),
    ratio: 524 / 840,
    ropeTile: require('../../../assets/brand/settings-rope-tile.png'),
    ropeTileRatio: 116 / 840,
  },
};

/** Fraction of a painted sign's height where the board's centre sits (below the ropes). */
export const PAINTED_BOARD_CENTRE = 0.73;
/** Fraction of a painted sign's height where its board's top edge sits. */
export const PAINTED_BOARD_TOP = 0.465;
export const paintedSignRatio = (title: string) => PAINTED[title]?.ratio;

/** A small brass flourish: two scrolls and a star, under a sign's title. */
const Flourish = ({ width }: { width: number }) => (
  <Svg width={width} height={width * 0.14} viewBox="0 0 120 17">
    <Path
      d="M8 9 C18 2 30 15 46 8 M112 9 C102 2 90 15 74 8"
      stroke={colors.brassLight}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
    />
    <Polygon points={starPoints(60, 9, 7.5, 3.2)} fill={colors.brassLight} />
  </Svg>
);

/**
 * Page title on a sign hung from ropes that run up off the top of the screen, as in the
 * saloon: wood-type title with a brass flourish underneath.
 */
export const HangingTitle = ({ title, width }: { title: string; width: number }) => {
  const painted = PAINTED[title];
  if (painted) {
    const h = width * painted.ratio;
    return (
      <View
        style={{ width, height: h }}
        accessibilityRole="header"
        accessible
        accessibilityLabel={title}
      >
        {[1, 2, 3].map((i) => (
          <Image
            key={i}
            source={painted.ropeTile}
            style={[
              styles.tile,
              {
                top: -width * painted.ropeTileRatio * i + 1,
                width,
                height: width * painted.ropeTileRatio,
              },
            ]}
            resizeMode="stretch"
            fadeDuration={0}
          />
        ))}
        <Image
          source={painted.source}
          style={{ width, height: h }}
          resizeMode="stretch"
          fadeDuration={0}
        />
      </View>
    );
  }
  const height = width * RATIO;
  return (
    <View
      style={{ width, height }}
      accessibilityRole="header"
      accessible
      accessibilityLabel={title}
    >
      {ROPES.map((f) => (
        <View
          key={f}
          pointerEvents="none"
          style={[styles.rope, { left: width * f - 3, top: -200, height: 200 + height * 0.06 }]}
        />
      ))}
      <Image source={SIGN} style={{ width, height }} resizeMode="stretch" fadeDuration={0} />
      <View style={[styles.content, { top: height * 0.2, bottom: height * 0.1 }]}>
        <AppText
          variant="title"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.title, { fontSize: width * 0.15, lineHeight: width * 0.2 }]}
        >
          {title}
        </AppText>
        <Flourish width={width * 0.45} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: { position: 'absolute', left: 0 },
  rope: {
    position: 'absolute',
    width: 6,
    borderRadius: 3,
    backgroundColor: colors.rope,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#6b4a24',
  },
  content: {
    position: 'absolute',
    left: '14%',
    right: '14%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.western,
    textShadowColor: '#1e0702',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
});
