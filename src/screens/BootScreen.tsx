import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { LogoMark } from '../components/ui/LogoMark';
import { colors, spacing } from '../theme';

/** Shown while progress, settings and the ad service load (usually a blink). */
export const BootScreen = () => {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.set(
      withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.7 + pulse.value * 0.3,
    transform: [{ scale: 0.96 + pulse.value * 0.04 }],
  }));
  return (
    <View style={styles.root} accessibilityLabel="Loading Prismase">
      <Animated.View style={style}>
        <LogoMark size={96} />
      </Animated.View>
      <ActivityIndicator color={colors.textSecondary} style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  spinner: { marginTop: spacing.xl },
});
