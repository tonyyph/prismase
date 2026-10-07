import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { type PaidAction, type PaymentPlan, paymentPlan } from '../../game/economy';
import { canAddExtraPrism, canUndo } from '../../game/reducer';
import { useRewardedReady } from '../../hooks/useAds';
import { usePrismaseGame } from '../../hooks/usePrismaseGame';
import { useGameStore } from '../../store/gameStore';
import { MIN_TOUCH, colors, radius, spacing } from '../../theme';
import { AdBadge } from '../ui/AdBadge';
import { AppText } from '../ui/AppText';
import { CoinIcon } from '../ui/CoinIcon';
import { ScalePressable } from '../ui/Pressable';

type ButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  badge?: React.ReactNode;
  accessibilityHint?: string;
};

const ActionButton = ({
  icon,
  label,
  onPress,
  disabled,
  badge,
  accessibilityHint,
}: ButtonProps) => (
  <ScalePressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityHint={accessibilityHint}
    accessibilityState={{ disabled }}
    style={styles.button}
  >
    <View style={styles.iconWrap}>
      <Ionicons name={icon} size={24} color={colors.textPrimary} />
    </View>
    <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
      {label}
    </AppText>
    <View style={styles.badgeSlot}>{badge}</View>
  </ScalePressable>
);

const PlanBadge = ({ plan, adReady }: { plan: PaymentPlan; adReady: boolean }) => {
  if (plan.kind === 'free') {
    return (
      <View style={[styles.chip, styles.freeChip]}>
        <AppText variant="caption" color={colors.emerald}>
          {plan.remaining} FREE
        </AppText>
      </View>
    );
  }
  if (plan.kind === 'inventory') {
    return (
      <View style={styles.chip}>
        <AppText variant="caption">×{plan.remaining}</AppText>
      </View>
    );
  }
  if (!plan.affordable && adReady) return <AdBadge />;
  return (
    <View style={styles.chip}>
      <CoinIcon size={11} />
      <AppText variant="caption" color={plan.affordable ? colors.amber : colors.textMuted}>
        {plan.cost}
      </AppText>
    </View>
  );
};

const PLACEMENT = {
  undo: 'reward_undo',
  hint: 'reward_hint',
  extraPrism: 'reward_extra_prism',
} as const;

const usePlan = (action: PaidAction) => {
  const level = useGameStore((s) => s.level);
  const progress = useGameStore((s) => s.progress);
  const adReady = useRewardedReady(PLACEMENT[action]);
  return { plan: level ? paymentPlan(action, level, progress) : null, adReady };
};

export const GameActionBar = memo(function GameActionBar() {
  const game = usePrismaseGame();
  const level = useGameStore((s) => s.level);
  const undo = usePlan('undo');
  const hint = usePlan('hint');
  const extra = usePlan('extraPrism');
  if (!level) return null;
  const extraAvailable = canAddExtraPrism(level);

  return (
    <View style={styles.bar}>
      <ActionButton
        icon="arrow-undo"
        label="Undo"
        onPress={game.undoMove}
        disabled={!canUndo(level)}
        badge={undo.plan ? <PlanBadge plan={undo.plan} adReady={undo.adReady} /> : null}
      />
      <ActionButton
        icon="bulb-outline"
        label="Hint"
        onPress={game.useHint}
        badge={hint.plan ? <PlanBadge plan={hint.plan} adReady={hint.adReady} /> : null}
      />
      <ActionButton
        icon="add-circle-outline"
        label="Prism"
        accessibilityHint="Adds one empty prism to this level"
        onPress={game.addExtraPrism}
        disabled={!extraAvailable}
        badge={
          !level.extraPrismUsed && extra.plan ? (
            <PlanBadge plan={extra.plan} adReady={extra.adReady} />
          ) : (
            <View style={styles.chip}>
              <AppText variant="caption" color={colors.textMuted}>
                USED
              </AppText>
            </View>
          )
        }
      />
      <ActionButton icon="refresh" label="Restart" onPress={() => void game.restartLevel()} />
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: MIN_TOUCH + 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceGlass,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.borderGlass,
    paddingVertical: spacing.sm,
  },
  iconWrap: { height: 26, justifyContent: 'center' },
  badgeSlot: { height: 18, justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  freeChip: { backgroundColor: 'rgba(52,211,153,0.14)' },
});
