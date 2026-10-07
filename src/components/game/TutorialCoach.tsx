import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { colors, radius, spacing } from '../../theme';
import { AppText } from '../ui/AppText';

/** One short line of guidance above the action bar during levels 1-3. */
export const TutorialCoach = ({
  message,
  icon,
}: {
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
}) => (
  <Animated.View
    key={message}
    entering={FadeInDown.duration(260)}
    exiting={FadeOutDown.duration(160)}
    style={styles.card}
    accessibilityLiveRegion="polite"
  >
    <View style={styles.icon}>
      <Ionicons name={icon} size={16} color={colors.cyan} />
    </View>
    <AppText variant="label" style={styles.text}>
      {message}
    </AppText>
  </Animated.View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.lg,
    marginBottom: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(34,211,238,0.10)',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(34,211,238,0.35)',
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34,211,238,0.16)',
  },
  text: { flexShrink: 1 },
});
