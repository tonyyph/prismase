import { StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../../hooks/usePersistedSettings';
import { useRollingNumber } from '../../hooks/useRollingNumber';
import { useGameStore } from '../../store/gameStore';
import { radius, spacing } from '../../theme';
import { AppText } from './AppText';
import { CoinIcon } from './CoinIcon';

/** Doubloon balance in a stitched leather pouch. Gains and spends are counted out, not jumped. */
export const CoinPill = () => {
  const coins = useGameStore((s) => s.progress.coins);
  const reducedMotion = useReducedMotion();
  const shown = useRollingNumber(coins, !reducedMotion);

  return (
    <View style={styles.pill} accessible accessibilityLabel={`${coins} doubloons`}>
      <View pointerEvents="none" style={styles.stitch} />
      <CoinIcon size={22} />
      <View>
        <AppText variant="number" style={styles.count}>
          {shown}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 92,
    height: 42,
    borderRadius: radius.sm + 2,
    backgroundColor: '#7a4428',
    borderWidth: 1.5,
    borderColor: '#3e1f10',
  },
  count: { fontVariant: ['tabular-nums'] },
  stitch: {
    ...StyleSheet.absoluteFill,
    margin: 4,
    borderRadius: radius.sm,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: '#e0b77a',
  },
});
