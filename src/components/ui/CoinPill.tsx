import { StyleSheet } from 'react-native';

import { useReducedMotion } from '../../hooks/usePersistedSettings';
import { useRollingNumber } from '../../hooks/useRollingNumber';
import { useGameStore } from '../../store/gameStore';
import { spacing } from '../../theme';
import { AppText } from './AppText';
import { CoinIcon } from './CoinIcon';
import { WoodChip } from './WoodChip';

/** Doubloon balance on a framed board. Gains and spends are counted out, not jumped. */
export const CoinPill = () => {
  const coins = useGameStore((s) => s.progress.coins);
  const reducedMotion = useReducedMotion();
  const shown = useRollingNumber(coins, !reducedMotion);

  return (
    <WoodChip style={styles.pill}>
      <CoinIcon size={24} />
      <AppText
        variant="number"
        style={styles.count}
        accessible
        accessibilityLabel={`${coins} doubloons`}
      >
        {shown}
      </AppText>
    </WoodChip>
  );
};

const styles = StyleSheet.create({
  pill: {
    gap: spacing.sm,
    minWidth: 108,
    height: 44,
  },
  count: { fontVariant: ['tabular-nums'] },
});
