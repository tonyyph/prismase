import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { type PaidAction, type PaymentPlan, paymentPlan } from '../../game/economy';
import { canAddExtraPrism, canUndo } from '../../game/reducer';
import { useRewardedReady } from '../../hooks/useAds';
import { usePrismaseGame } from '../../hooks/usePrismaseGame';
import { useGameStore } from '../../store/gameStore';
import { colors, spacing } from '../../theme';
import { WesternIcon, type WesternIconName } from '../art/WesternIcon';
import { AdBadge } from '../ui/AdBadge';
import { AppText } from '../ui/AppText';
import { CoinIcon } from '../ui/CoinIcon';
import { ScalePressable } from '../ui/Pressable';

type ButtonProps = {
  icon: WesternIconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Shown on the paper plaque; leave undefined for an action with no count or price. */
  badge?: React.ReactNode;
  accessibilityHint?: string;
};

/** Tony's tile with a riveted paper plaque underneath; the plaque carries a count or price. */
const PLAQUE_TILE = require('../../../assets/brand/action-tile.png');
/** Trimmed art is 300 × 307; these fractions locate the wood face and the paper plaque. */
const TILE_RATIO = 300 / 307;
/** Tony's plain framed tile (no plaque), trimmed to 300 × 283. */
const PLAIN_TILE = require('../../../assets/brand/action-tile-plain.png');

const ActionButton = ({
  icon,
  label,
  onPress,
  disabled,
  badge,
  accessibilityHint,
}: ButtonProps) => {
  const face = (
    <>
      <WesternIcon name={icon} size={26} color={colors.textPrimary} />
      <AppText variant="caption" numberOfLines={1}>
        {label.toUpperCase()}
      </AppText>
    </>
  );
  return (
    <ScalePressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={styles.button}
    >
      {badge !== undefined ? (
        <View style={styles.plaqueTile}>
          <Image
            source={PLAQUE_TILE}
            style={styles.plaqueArt}
            resizeMode="stretch"
            fadeDuration={0}
          />
          <View style={styles.woodFace}>{face}</View>
          {badge ? <View style={styles.plaque}>{badge}</View> : null}
        </View>
      ) : (
        <View style={styles.plainTile}>
          <Image
            source={PLAIN_TILE}
            style={styles.plaqueArt}
            resizeMode="stretch"
            fadeDuration={0}
          />
          <View style={styles.plainFace}>{face}</View>
        </View>
      )}
    </ScalePressable>
  );
};

/** Text written on the tile's paper plaque. */
const Tag = ({ text, ink = colors.ink }: { text: string; ink?: string }) => (
  <AppText variant="caption" color={ink} numberOfLines={1} style={styles.tagText}>
    {text}
  </AppText>
);

const PlanBadge = ({ plan, adReady }: { plan: PaymentPlan; adReady: boolean }) => {
  if (plan.kind === 'free') return <Tag text={`${plan.remaining} FREE`} ink={colors.freeInk} />;
  if (plan.kind === 'inventory') return <Tag text={`×${plan.remaining}`} />;
  if (!plan.affordable && adReady) return <AdBadge />;
  return (
    <View style={styles.cost}>
      <CoinIcon size={11} />
      <AppText
        variant="caption"
        color={plan.affordable ? colors.ink : colors.inkSoft}
        style={styles.tagText}
      >
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
  button: { flex: 1, aspectRatio: TILE_RATIO },
  plaqueTile: { flex: 1, overflow: 'hidden' },
  plainTile: { width: '100%', aspectRatio: 300 / 283 },
  plainFace: {
    position: 'absolute',
    top: '14%',
    bottom: '14%',
    left: '14%',
    right: '14%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  plaqueArt: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' },
  // Wood face spans 11-78% of the art's height, the plaque's writable strip 85-98% (between
  // its rivets, 23-77% of the width).
  woodFace: {
    position: 'absolute',
    top: '12%',
    bottom: '24%',
    left: '12%',
    right: '12%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  plaque: {
    position: 'absolute',
    top: '83%',
    bottom: '1%',
    left: '22%',
    right: '22%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The plaque strip is only ~11 pt tall on small phones; size text to it explicitly.
  tagText: { fontSize: 10, lineHeight: 12, letterSpacing: 0.4 },
  cost: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
