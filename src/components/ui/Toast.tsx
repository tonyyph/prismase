import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGameStore } from '../../store/gameStore';
import { colors, motion, radius, spacing } from '../../theme';
import { AppText } from './AppText';

const Bubble = ({ message }: { message: string }) => {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <Animated.View
      entering={FadeInUp.duration(320).easing(motion.settle)}
      exiting={FadeOut.duration(220)}
      pointerEvents="none"
      style={[styles.toast, { top: insets.top + 64 }]}
      accessibilityLiveRegion="polite"
    >
      <AppText variant="label" align="center" color={colors.ink}>
        {message}
      </AppText>
    </Animated.View>
  );
};

/** Short status line; each new toast remounts the bubble and restarts its timer. */
export const Toast = () => {
  const toast = useGameStore((s) => s.toast);
  return toast ? <Bubble key={toast.seq} message={toast.message} /> : null;
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: '86%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.parchment,
    borderWidth: 1.5,
    borderColor: colors.parchmentDark,
  },
});
