import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { WesternIcon } from '../components/art/WesternIcon';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { menuSunY } from '../components/ui/Backdrop';
import { CoinPill } from '../components/ui/CoinPill';
import { IconButton } from '../components/ui/IconButton';
import { LogoMark } from '../components/ui/LogoMark';
import { ScalePressable } from '../components/ui/Pressable';
import { Screen } from '../components/ui/Screen';
import { WoodTile } from '../components/ui/WoodTile';
import { Ribbon, Wordmark } from '../components/ui/Wordmark';
import { REWARDS } from '../game/economy';
import { getLevelConfig } from '../game/levelConfig';
import { canClaimDaily } from '../game/progress';
import { usePrismaseGame } from '../hooks/usePrismaseGame';
import { useGameStore } from '../store/gameStore';
import { colors, motion, spacing } from '../theme';

/** The outlaw mark under the noon sun; it settles into place once and then holds still. */
const HeroMark = ({ size }: { size: number }) => (
  <Animated.View entering={FadeInDown.duration(700).easing(motion.settle)}>
    <LogoMark size={size} />
  </Animated.View>
);

export const MainMenuScreen = () => {
  const game = usePrismaseGame();
  const { width: W, height: H } = useWindowDimensions();
  const progress = useGameStore((s) => s.progress);
  const claimDailyReward = useGameStore((s) => s.claimDailyReward);
  const dailyAvailable = useGameStore((s) => canClaimDaily(s.progress, Date.now()));
  const hasPlayed = progress.gamesPlayed > 0;
  const current = progress.currentLevel;
  const newest = progress.unlockedLevel;
  const difficulty = getLevelConfig(current).difficulty;
  const markSize = Math.min(W * 0.52, H * 0.26);
  const markTop = menuSunY(H) + H * 0.03;

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.mark, { top: markTop, left: W / 2 - markSize / 2 }]}>
          <HeroMark size={markSize} />
        </View>
        <Animated.View
          entering={FadeIn.duration(600).delay(200)}
          style={[styles.title, { top: markTop + markSize * 0.92 }]}
        >
          <Wordmark width={Math.min(W - 40, 340)} />
          <Ribbon label="SORT THE SPECTRUM" width={Math.min(W - 80, 260)} />
        </Animated.View>
      </View>

      <Screen>
        <View style={styles.topRow}>
          {dailyAvailable ? (
            <ScalePressable
              onPress={claimDailyReward}
              style={styles.daily}
              accessibilityRole="button"
              accessibilityLabel={`Open the daily chest, ${REWARDS.daily} doubloons`}
            >
              <WoodTile style={styles.dailyTile}>
                <WesternIcon name="chest" size={22} />
                <AppText variant="label">DAILY</AppText>
                <AppText variant="treasure" color={colors.brassLight} style={styles.dailyAmount}>
                  +{REWARDS.daily}
                </AppText>
              </WoodTile>
            </ScalePressable>
          ) : (
            <View />
          )}
          <CoinPill />
        </View>

        <View style={styles.spacer} />

        <Animated.View
          entering={FadeInDown.duration(600).delay(250).easing(motion.settle)}
          style={styles.actions}
        >
          <View style={styles.levelTag}>
            <AppText variant="caption" color={colors.textSecondary}>
              LEVEL {current} · {difficulty.toUpperCase()}
            </AppText>
          </View>
          <AppButton
            variant="primary"
            label={hasPlayed ? `Continue · Level ${current}` : 'Ride Out'}
            onPress={game.continueGame}
          />
          {hasPlayed && newest !== current ? (
            <AppButton
              icon="arrow"
              label={`Play Level ${newest}`}
              onPress={() => game.startLevel(newest)}
            />
          ) : null}
          <AppButton icon="map" label="Level Select" onPress={() => game.navigate('levelSelect')} />
          <View style={styles.iconRow}>
            <IconButton
              icon="help"
              label="How to play"
              onPress={() => game.navigate('howToPlay')}
            />
            <IconButton
              icon="settings"
              label="Settings"
              onPress={() => game.navigate('settings')}
            />
          </View>
        </Animated.View>
      </Screen>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  mark: { position: 'absolute' },
  title: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: 0 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  daily: { height: 44 },
  dailyTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
  },
  dailyAmount: { fontSize: 22, lineHeight: 29 },
  spacer: { flex: 1 },
  levelTag: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: colors.woodDark,
    borderWidth: 1,
    borderColor: '#2b170c',
  },
  actions: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
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
});
