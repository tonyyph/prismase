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
import { colors, radius, spacing } from '../../theme';
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
      accessibilityLabel={`${coins} prism coins`}
    >
      <CoinIcon size={18} />
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
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceGlass,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(251,191,36,0.35)',
  },
});
