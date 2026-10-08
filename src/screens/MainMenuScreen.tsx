import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WesternIcon } from '../components/art/WesternIcon';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { CoinPill } from '../components/ui/CoinPill';
import { IconButton } from '../components/ui/IconButton';
import { ScalePressable } from '../components/ui/Pressable';
import { WoodChip } from '../components/ui/WoodChip';
import { WoodLabel } from '../components/ui/WoodLabel';
import { REWARDS } from '../game/economy';
import { getLevelConfig } from '../game/levelConfig';
import { canClaimDaily } from '../game/progress';
import { usePrismaseGame } from '../hooks/usePrismaseGame';
import { useGameStore } from '../store/gameStore';
import { colors, fonts, motion, spacing } from '../theme';

/** Height reserved for the HUD row and the action stack, used to size the hero to fit. */
const HUD_H = 56;
const ACTIONS_H = 300;

/** Tony's hero art (outlaw mark + title sign + ribbon), trimmed to its bounds: 1200 × 992. */
const HERO = require('../../assets/brand/hero.png');
const HERO_RATIO = 992 / 1200;

export const MainMenuScreen = () => {
  const game = usePrismaseGame();
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const progress = useGameStore((s) => s.progress);
  const claimDailyReward = useGameStore((s) => s.claimDailyReward);
  const dailyAvailable = useGameStore((s) => canClaimDaily(s.progress, Date.now()));
  const current = progress.currentLevel;
  const newest = progress.unlockedLevel;
  const difficulty = getLevelConfig(current).difficulty;

  // The status bar is hidden here, so keep the HUD off the very edge (and clear of a notch).
  const top = Math.max(insets.top, 14);
  const bottom = Math.max(insets.bottom + 12, 28);
  const heroH = H - top - bottom - HUD_H - ACTIONS_H;
  const heroW = Math.min(W - 48, 460, heroH / HERO_RATIO);

  return (
    <View style={[styles.root, { paddingTop: top, paddingBottom: bottom }]}>
      <StatusBar hidden />

      <View style={styles.hud}>
        {dailyAvailable ? (
          <ScalePressable
            onPress={claimDailyReward}
            accessibilityRole="button"
            accessibilityLabel={`Open the daily chest, ${REWARDS.daily} doubloons`}
            style={styles.dailyPress}
          >
            <WoodChip style={styles.daily}>
              <WesternIcon name="chest" size={22} color={colors.brassLight} />
              <AppText variant="label">DAILY</AppText>
              <AppText variant="number" color={colors.brassLight} style={styles.dailyAmount}>
                +{REWARDS.daily}
              </AppText>
            </WoodChip>
          </ScalePressable>
        ) : (
          <View />
        )}
        <CoinPill />
      </View>

      <View style={styles.hero}>
        <Animated.View entering={FadeInDown.duration(700).easing(motion.settle)}>
          <Image
            source={HERO}
            style={{ width: heroW, height: heroW * HERO_RATIO }}
            resizeMode="contain"
            accessible
            accessibilityLabel="Prismase. Sort the spectrum."
          />
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(250).easing(motion.settle)}
        style={styles.actions}
      >
        <WoodLabel style={styles.levelTag}>
          <AppText variant="caption" style={styles.levelText}>
            LEVEL {current} · {difficulty.toUpperCase()}
          </AppText>
        </WoodLabel>

        <AppButton variant="primary" size="hero" label="Ride Out" onPress={game.continueGame} />

        {newest !== current ? (
          <View style={styles.secondary}>
            <AppButton
              icon="arrow"
              label={`Play Level ${newest}`}
              onPress={() => game.startLevel(newest)}
            />
          </View>
        ) : null}
        <View style={styles.secondary}>
          <AppButton icon="map" label="Level Select" onPress={() => game.navigate('levelSelect')} />
        </View>

        <View style={styles.iconRow}>
          <IconButton
            icon="help"
            box={56}
            size={24}
            label="How to play"
            onPress={() => game.navigate('howToPlay')}
          />
          <IconButton
            icon="settings"
            box={56}
            size={24}
            label="Settings"
            onPress={() => game.navigate('settings')}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  hud: {
    height: HUD_H,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg + 2,
  },
  dailyPress: { height: 44 },
  daily: { flex: 1, gap: 7 },
  dailyAmount: { fontFamily: fonts.western, fontSize: 19, lineHeight: 26 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  actions: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl + 6,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  levelTag: { alignSelf: 'center' },
  levelText: { color: colors.textPrimary, letterSpacing: 2 },
  secondary: { paddingHorizontal: spacing.xl },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.xs,
  },
});
