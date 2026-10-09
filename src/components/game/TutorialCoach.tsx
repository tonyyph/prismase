import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';

import { colors, motion, spacing } from '../../theme';
import { starPoints } from '../art/geometry';
import { AppText } from '../ui/AppText';
import { PlankImage } from '../ui/PlankImage';

/** One short line of guidance on a riveted parchment banner, during levels 1-3. */
export const TutorialCoach = ({ message }: { message: string }) => (
  <Animated.View
    key={message}
    entering={FadeInDown.duration(360).easing(motion.settle)}
    exiting={FadeOut.duration(200)}
    style={styles.wrap}
    accessibilityLiveRegion="polite"
  >
    <PlankImage tone="paper" style={styles.note}>
      <Svg width={18} height={18} viewBox="0 0 20 20">
        <Polygon points={starPoints(10, 10.5, 9, 3.8)} fill={colors.stamp} />
      </Svg>
      <View style={styles.text}>
        <AppText
          variant="heading"
          color={colors.ink}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {message}
        </AppText>
      </View>
    </PlankImage>
  </Animated.View>
);

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', maxWidth: '94%', marginBottom: spacing.xs },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 50,
    // Clear the rivets at either end of the banner.
    paddingHorizontal: 36,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  text: { flexShrink: 1 },
});
