import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { type PaidAction, type PaymentPlan, paymentPlan } from '../../game/economy';
import { canAddExtraPrism, canUndo } from '../../game/reducer';
import { useRewardedReady } from '../../hooks/useAds';
import { usePrismaseGame } from '../../hooks/usePrismaseGame';
import { useGameStore } from '../../store/gameStore';
import { MIN_TOUCH, colors, spacing } from '../../theme';
import { WesternIcon, type WesternIconName } from '../art/WesternIcon';
import { AdBadge } from '../ui/AdBadge';
import { AppText } from '../ui/AppText';
import { CoinIcon } from '../ui/CoinIcon';
import { ScalePressable } from '../ui/Pressable';
import { WoodTile } from '../ui/WoodTile';

type ButtonProps = {
  icon: WesternIconName;
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
    <WoodTile style={styles.tile}>
      <WesternIcon name={icon} size={26} color={colors.textPrimary} />
      <AppText variant="caption" numberOfLines={1}>
        {label.toUpperCase()}
      </AppText>
      <View style={styles.badgeSlot}>{badge}</View>
    </WoodTile>
  </ScalePressable>
);

/** A parchment price tag on a string. */
const Tag = ({ text, ink = colors.ink }: { text: string; ink?: string }) => (
  <View style={styles.tag}>
    <AppText variant="caption" color={ink} style={styles.tagText}>
      {text}
    </AppText>
    <View style={styles.tagHole} />
  </View>
);

const PlanBadge = ({ plan, adReady }: { plan: PaymentPlan; adReady: boolean }) => {
  if (plan.kind === 'free') return <Tag text={`${plan.remaining} FREE`} ink={colors.freeInk} />;
  if (plan.kind === 'inventory') return <Tag text={`×${plan.remaining}`} />;
  if (!plan.affordable && adReady) return <AdBadge />;
  return (
    <View style={styles.cost}>
      <CoinIcon size={14} />
      <AppText variant="caption" color={plan.affordable ? colors.textPrimary : colors.textMuted}>
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
        icon="undo"
        label="Undo"
        onPress={game.undoMove}
        disabled={!canUndo(level)}
        badge={undo.plan ? <PlanBadge plan={undo.plan} adReady={undo.adReady} /> : null}
      />
      <ActionButton
        icon="hint"
        label="Hint"
        onPress={game.useHint}
        badge={hint.plan ? <PlanBadge plan={hint.plan} adReady={hint.adReady} /> : null}
      />
      <ActionButton
        icon="extra"
        label="Crate"
        accessibilityHint="Adds one empty crate to this level"
        onPress={game.addExtraPrism}
        disabled={!extraAvailable}
        badge={
          !level.extraPrismUsed && extra.plan ? (
            <PlanBadge plan={extra.plan} adReady={extra.adReady} />
          ) : (
            <Tag text="USED" ink={colors.inkSoft} />
          )
        }
      />
      <ActionButton icon="restart" label="Restart" onPress={() => void game.restartLevel()} />
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
  button: { flex: 1, minHeight: MIN_TOUCH + 36 },
  tile: { alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: spacing.sm },
  badgeSlot: { height: 20, justifyContent: 'center' },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingLeft: 6,
    paddingRight: 4,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: '#8a6a3a',
    borderRadius: 2,
    transform: [{ rotate: '-3deg' }],
  },
  tagText: { letterSpacing: 0.6 },
  tagHole: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#6b4a24' },
  cost: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
