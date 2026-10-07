import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useRewardedReady } from '../../hooks/useAds';
import { useReducedMotion } from '../../hooks/usePersistedSettings';
import { usePrismaseGame } from '../../hooks/usePrismaseGame';
import { useGameStore } from '../../store/gameStore';
import { colors, radius, spacing } from '../../theme';
import { formatDuration } from '../../utils/time';
import { AdBadge } from '../ui/AdBadge';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { CoinIcon } from '../ui/CoinIcon';
import { LogoMark } from '../ui/LogoMark';
import { Confetti } from './Confetti';
import { ModalShell } from './ModalShell';

const Stat = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <View style={styles.stat}>
    <View style={styles.statValue}>
      {icon}
      <AppText variant="heading">{value}</AppText>
    </View>
    <AppText variant="caption" color={colors.textSecondary}>
      {label}
    </AppText>
  </View>
);

export const LevelCompleteModal = () => {
  const game = usePrismaseGame();
  const win = useGameStore((s) => s.lastWin);
  const busy = useGameStore((s) => s.busy);
  const reducedMotion = useReducedMotion();
  const doubleReady = useRewardedReady('reward_double_coins');
  if (!win) return null;

  const coins = win.doubled ? win.coinsEarned * 2 : win.coinsEarned;

  return (
    <ModalShell
      delay={reducedMotion ? 0 : 450}
      behind={reducedMotion ? null : <Confetti seed={`win-${win.level}-${win.moves}`} />}
    >
      <View style={styles.header}>
        <LogoMark size={52} />
        <AppText variant="caption" color={colors.textSecondary}>
          LEVEL {win.level}
        </AppText>
        <AppText variant="title" align="center">
          Level Complete
        </AppText>
      </View>

      <View style={styles.stats}>
        <Stat label="COINS" value={`+${coins}`} icon={<CoinIcon size={18} />} />
        <View style={styles.divider} />
        <Stat label="MOVES" value={`${win.moves}`} />
        <View style={styles.divider} />
        <Stat label="TIME" value={formatDuration(win.timeMs)} />
      </View>

      <View style={styles.buttons}>
        <AppButton
          variant="primary"
          icon="arrow-forward"
          label="Continue"
          disabled={busy}
          onPress={() => void game.goToNextLevel()}
        />
        {!win.doubled && win.coinsEarned > 0 ? (
          <AppButton
            icon="sparkles-outline"
            label={`Double to ${win.coinsEarned * 2}`}
            accessory={<AdBadge />}
            disabled={!doubleReady || busy}
            onPress={() => void game.doubleCoins()}
          />
        ) : win.doubled ? (
          <View style={styles.doubled}>
            <Ionicons name="checkmark-circle" size={18} color={colors.emerald} />
            <AppText variant="label" color={colors.emerald}>
              Coins doubled
            </AppText>
          </View>
        ) : null}
        <AppButton
          icon="refresh"
          label="Replay"
          disabled={busy}
          onPress={() => game.replayLevel(win.level)}
        />
      </View>
    </ModalShell>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  divider: { width: StyleSheet.hairlineWidth * 2, height: 32, backgroundColor: colors.borderGlass },
  buttons: { gap: spacing.md },
  doubled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 54,
  },
});
