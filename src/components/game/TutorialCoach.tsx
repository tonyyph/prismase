import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';

import { colors, motion, spacing } from '../../theme';
import { starPoints } from '../art/geometry';
import { AppText } from '../ui/AppText';

/** One short line of guidance on a scrap of parchment, during levels 1-3. */
export const TutorialCoach = ({ message }: { message: string }) => (
  // The entrance animates the wrapper; the paper's slight tilt lives on the inner view.
  <Animated.View
    key={message}
    entering={FadeInDown.duration(360).easing(motion.settle)}
    exiting={FadeOut.duration(200)}
    style={styles.wrap}
    accessibilityLiveRegion="polite"
  >
    <View style={styles.note}>
      <Svg width={18} height={18} viewBox="0 0 20 20">
        <Polygon points={starPoints(10, 10.5, 9, 3.8)} fill={colors.stamp} />
      </Svg>
      <View style={styles.text}>
        <AppText variant="heading" color={colors.ink}>
          {message}
        </AppText>
      </View>
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center' },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: '#8a6a3a',
    borderRadius: 2,
    transform: [{ rotate: '-1deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
  },
  text: { flexShrink: 1 },
});
