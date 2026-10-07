import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../hooks/usePersistedSettings';
import { useGameStore } from '../../store/gameStore';
import { radius, spacing } from '../../theme';
import { AppText } from './AppText';
import { CoinIcon } from './CoinIcon';

/** Coin balance that pops whenever coins are earned. */
export const CoinPill = () => {
  const coins = useGameStore((s) => s.progress.coins);
  const pulse = useGameStore((s) => s.coinPulse);
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (pulse === 0 || reducedMotion) return;
    scale.set(withSequence(withSpring(1.18, { stiffness: 500 }), withSpring(1, { damping: 12 })));
  }, [pulse, reducedMotion, scale]);

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[styles.pill, animated]}
      accessible
      accessibilityLabel={`${coins} doubloons`}
    >
      <View pointerEvents="none" style={styles.stitch} />
      <CoinIcon size={22} />
      <View>
        <AppText variant="number">{coins}</AppText>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 92,
    height: 42,
    borderRadius: radius.sm + 2,
    backgroundColor: '#7a4428',
    borderWidth: 1.5,
    borderColor: '#3e1f10',
  },
  stitch: {
    ...StyleSheet.absoluteFill,
    margin: 4,
    borderRadius: radius.sm,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: '#e0b77a',
  },
});
