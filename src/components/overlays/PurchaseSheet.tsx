import { StyleSheet, View } from 'react-native';

import { COSTS, type PaidAction } from '../../game/economy';
import { useRewardedReady } from '../../hooks/useAds';
import { useGameStore } from '../../store/gameStore';
import { colors, spacing } from '../../theme';
import { WesternIcon, type WesternIconName } from '../art/WesternIcon';
import { AdBadge } from '../ui/AdBadge';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { CoinIcon } from '../ui/CoinIcon';
import { ModalShell } from './ModalShell';

const COPY: Record<PaidAction, { title: string; body: string; icon: WesternIconName }> = {
  hint: { title: 'Hint', body: 'Light the lantern on a good next move.', icon: 'hint' },
  undo: { title: 'Undo', body: 'Free undos are used up for this level.', icon: 'undo' },
  extraPrism: {
    title: 'Extra Crate',
    body: 'Add one empty crate to this level.',
    icon: 'extra',
  },
};

const PLACEMENT = {
  hint: 'reward_hint',
  undo: 'reward_undo',
  extraPrism: 'reward_extra_prism',
} as const;

/** Offered when an action has no free use left: pay coins or watch a rewarded ad. */
export const PurchaseSheet = ({ action }: { action: PaidAction }) => {
  const coins = useGameStore((s) => s.progress.coins);
  const busy = useGameStore((s) => s.busy);
  const payWithCoins = useGameStore((s) => s.payWithCoins);
  const payWithAd = useGameStore((s) => s.payWithAd);
  const close = useGameStore((s) => s.closePurchase);
  const adReady = useRewardedReady(PLACEMENT[action]);
  const cost = COSTS[action];
  const copy = COPY[action];

  return (
    <ModalShell onDismiss={busy ? undefined : close}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <WesternIcon name={copy.icon} size={30} color={colors.ink} />
        </View>
        <AppText variant="title">{copy.title}</AppText>
        <AppText color={colors.textSecondary} align="center">
          {copy.body}
        </AppText>
      </View>
      <View style={styles.buttons}>
        <AppButton
          variant="primary"
          label={`Pay ${cost} doubloons`}
          accessory={<CoinIcon size={16} />}
          disabled={coins < cost || busy}
          onPress={payWithCoins}
        />
        <AppButton
          label="Watch an ad"
          accessory={<AdBadge />}
          disabled={!adReady || busy}
          onPress={() => void payWithAd()}
        />
        <AppButton variant="ghost" label="Not now" onPress={close} disabled={busy} />
      </View>
      {coins < cost ? (
        <AppText variant="caption" color={colors.textMuted} align="center" style={styles.note}>
          You have {coins} doubloons
        </AppText>
      ) : null}
    </ModalShell>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xl },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.parchment,
    borderWidth: 2,
    borderColor: colors.brassDark,
    marginBottom: spacing.sm,
  },
  buttons: { gap: spacing.md },
  note: { marginTop: spacing.md },
});
