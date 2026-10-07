import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';

import { colors, spacing } from '../../theme';
import { starPoints } from '../art/geometry';
import { AppText } from '../ui/AppText';

/** One short line of guidance on a scrap of parchment, during levels 1-3. */
export const TutorialCoach = ({ message }: { message: string }) => (
  <Animated.View
    key={message}
    entering={FadeInDown.duration(260)}
    exiting={FadeOutDown.duration(160)}
    style={styles.note}
    accessibilityLiveRegion="polite"
  >
    <Svg width={18} height={18} viewBox="0 0 20 20">
      <Polygon points={starPoints(10, 10.5, 9, 3.8)} fill={colors.stamp} />
    </Svg>
    <View style={styles.text}>
      <AppText variant="heading" color={colors.ink}>
        {message}
      </AppText>
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
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
