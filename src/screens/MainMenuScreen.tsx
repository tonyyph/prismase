import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { PrismItem } from '../components/game/PrismItem';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { CoinIcon } from '../components/ui/CoinIcon';
import { CoinPill } from '../components/ui/CoinPill';
import { IconButton } from '../components/ui/IconButton';
import { LogoMark } from '../components/ui/LogoMark';
import { ScalePressable } from '../components/ui/Pressable';
import { Screen } from '../components/ui/Screen';
import { Wordmark } from '../components/ui/Wordmark';
import { REWARDS } from '../game/economy';
import { getLevelConfig } from '../game/levelConfig';
import { canClaimDaily } from '../game/progress';
import { useReducedMotion } from '../hooks/usePersistedSettings';
import { usePrismaseGame } from '../hooks/usePrismaseGame';
import { useGameStore } from '../store/gameStore';
import { colors, radius, spacing } from '../theme';

const FLOATERS = [
  { colorId: 'cyan', x: 0.12, y: 0.16, size: 34, period: 5200 },
  { colorId: 'pink', x: 0.82, y: 0.12, size: 28, period: 6100 },
  { colorId: 'violet', x: 0.86, y: 0.5, size: 40, period: 5600 },
  { colorId: 'amber', x: 0.08, y: 0.58, size: 26, period: 6600 },
  { colorId: 'emerald', x: 0.7, y: 0.3, size: 22, period: 5900 },
];

const Floater = ({ colorId, x, y, size, period }: (typeof FLOATERS)[number]) => {
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) return undefined;
    t.set(
      withRepeat(withTiming(1, { duration: period, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    return () => cancelAnimation(t);
  }, [t, period, reducedMotion]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: (t.value - 0.5) * 18 }, { rotate: `${(t.value - 0.5) * 16}deg` }],
  }));
  return (
    <Animated.View
      style={[styles.floater, { left: x * width, top: y * height, opacity: 0.55 }, style]}
    >
      <PrismItem colorId={colorId} size={size} />
    </Animated.View>
  );
};

const Floaters = memo(function Floaters() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {FLOATERS.map((f) => (
        <Floater key={f.colorId} {...f} />
      ))}
    </View>
  );
});

export const MainMenuScreen = () => {
  const game = usePrismaseGame();
  const progress = useGameStore((s) => s.progress);
  const claimDailyReward = useGameStore((s) => s.claimDailyReward);
  const dailyAvailable = useGameStore((s) => canClaimDaily(s.progress, Date.now()));
  const hasPlayed = progress.gamesPlayed > 0;
  const current = progress.currentLevel;
  const newest = progress.unlockedLevel;
  const difficulty = getLevelConfig(current).difficulty;

  return (
    <Screen>
      <Floaters />
      <View style={styles.topRow}>
        {dailyAvailable ? (
          <ScalePressable
            onPress={claimDailyReward}
            style={styles.daily}
            accessibilityRole="button"
            accessibilityLabel={`Claim daily reward, ${REWARDS.daily} coins`}
          >
            <Ionicons name="gift-outline" size={18} color={colors.amber} />
            <AppText variant="label">Daily</AppText>
            <CoinIcon size={14} />
            <AppText variant="label" color={colors.amber}>
              +{REWARDS.daily}
            </AppText>
          </ScalePressable>
        ) : (
          <View />
        )}
        <CoinPill />
      </View>

      <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
        <LogoMark size={104} />
        <Wordmark width={260} />
        <AppText color={colors.textSecondary} variant="label" style={styles.tagline}>
          Sort the spectrum.
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.actions}>
        <AppText variant="caption" color={colors.textSecondary} align="center">
          LEVEL {current} · {difficulty.toUpperCase()}
        </AppText>
        <AppButton
          variant="primary"
          icon="play"
          label={hasPlayed ? `Continue · Level ${current}` : 'Play'}
          onPress={game.continueGame}
        />
        {hasPlayed && newest !== current ? (
          <AppButton
            icon="flash-outline"
            label={`Play Level ${newest}`}
            onPress={() => game.startLevel(newest)}
          />
        ) : null}
        <AppButton
          icon="grid-outline"
          label="Level Select"
          onPress={() => game.navigate('levelSelect')}
        />
        <View style={styles.iconRow}>
          <IconButton
            icon="help-circle-outline"
            label="How to play"
            onPress={() => game.navigate('howToPlay')}
          />
          <IconButton
            icon="settings-outline"
            label="Settings"
            onPress={() => game.navigate('settings')}
          />
        </View>
      </Animated.View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  daily: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  tagline: { letterSpacing: 1.5 },
  actions: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  floater: { position: 'absolute' },
});
