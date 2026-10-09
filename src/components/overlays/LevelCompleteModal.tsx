import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useRewardedReady } from '../../hooks/useAds';
import { useReducedMotion } from '../../hooks/usePersistedSettings';
import { usePrismaseGame } from '../../hooks/usePrismaseGame';
import { useGameStore } from '../../store/gameStore';
import { colors, fonts, spacing } from '../../theme';
import { formatDuration } from '../../utils/time';
import { PrismItem } from '../game/PrismItem';
import { AdBadge } from '../ui/AdBadge';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { CoinIcon } from '../ui/CoinIcon';
import { ScalePressable } from '../ui/Pressable';
import { Confetti } from './Confetti';
import { ModalShell } from './ModalShell';

/** Rubber stamp with the level number, slapped on the poster at an angle. */
const LevelStamp = ({ level }: { level: number }) => (
  <View style={styles.stamp} pointerEvents="none">
    <Svg width={64} height={64} viewBox="0 0 64 64" style={StyleSheet.absoluteFill}>
      <Circle cx={32} cy={32} r={29} fill="none" stroke={colors.stamp} strokeWidth={2.4} />
      <Circle cx={32} cy={32} r={24} fill="none" stroke={colors.stamp} strokeWidth={1} />
    </Svg>
    <AppText variant="caption" color={colors.stamp} align="center" style={styles.stampSmall}>
      LEVEL
    </AppText>
    <AppText variant="title" color={colors.stamp} align="center" style={styles.stampBig}>
      {level}
    </AppText>
  </View>
);

/** The win screen is a wanted poster: the bounty has been collected. */
export const LevelCompleteModal = () => {
  const game = usePrismaseGame();
  const win = useGameStore((s) => s.lastWin);
  const lastColor = useGameStore((s) => s.level?.moveHistory.at(-1)?.item.colorId);
  const busy = useGameStore((s) => s.busy);
  const reducedMotion = useReducedMotion();
  const doubleReady = useRewardedReady('reward_double_coins');
  if (!win) return null;

  const coins = win.doubled ? win.coinsEarned * 2 : win.coinsEarned;

  return (
    <ModalShell
      material="parchment"
      delay={reducedMotion ? 0 : 450}
      behind={reducedMotion ? null : <Confetti seed={`win-${win.level}-${win.moves}`} />}
    >
      <View style={styles.header}>
        <AppText variant="hero" color={colors.ink} align="center" style={styles.bounty}>
          BOUNTY
        </AppText>
        <AppText variant="label" color={colors.ink} align="center" style={styles.collected}>
          COLLECTED
        </AppText>
        <View style={styles.rule} />
      </View>

      <View style={styles.portrait}>
        <PrismItem colorId={lastColor ?? 'lasso'} size={76} />
        <LevelStamp level={win.level} />
      </View>

      <AppText variant="caption" color={colors.ink} align="center">
        REWARD
      </AppText>
      <View style={styles.reward}>
        <CoinIcon size={30} />
        <AppText variant="treasure" color={colors.ink}>
          {coins} {coins === 1 ? 'Doubloon' : 'Doubloons'}
        </AppText>
      </View>
      <AppText variant="body" color={colors.inkSoft} align="center" style={styles.stats}>
        {win.moves} moves · {formatDuration(win.timeMs)} on the clock
      </AppText>

      <View style={styles.buttons}>
        <AppButton
          variant="primary"
          label="Ride On"
          disabled={busy}
          onPress={() => void game.goToNextLevel()}
        />
        {!win.doubled && win.coinsEarned > 0 ? (
          <AppButton
            label="Double it"
            accessory={<AdBadge />}
            disabled={!doubleReady || busy}
            onPress={() => void game.doubleCoins()}
          />
        ) : win.doubled ? (
          <AppText variant="label" color={colors.freeInk} align="center" style={styles.doubled}>
            BOUNTY DOUBLED
          </AppText>
        ) : null}
        <ScalePressable
          disabled={busy}
          onPress={() => game.replayLevel(win.level)}
          accessibilityRole="button"
          accessibilityLabel="Replay"
          style={styles.replay}
        >
          <AppText variant="label" color={colors.inkSoft}>
            REPLAY
          </AppText>
        </ScalePressable>
      </View>
    </ModalShell>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center' },
  bounty: { fontFamily: fonts.western, fontSize: 40, lineHeight: 52 },
  collected: { letterSpacing: 6 },
  rule: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: colors.ink,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  portrait: { alignItems: 'center', justifyContent: 'center', height: 100 },
  stamp: {
    position: 'absolute',
    right: 4,
    top: 14,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-14deg' }],
    opacity: 0.9,
  },
  stampSmall: { fontSize: 9, lineHeight: 12, marginTop: 4 },
  stampBig: { fontSize: 18, lineHeight: 25 },
  reward: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  stats: { marginBottom: spacing.lg },
  buttons: { gap: spacing.md },
  doubled: { paddingVertical: spacing.md },
  replay: { alignSelf: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.xl },
});
