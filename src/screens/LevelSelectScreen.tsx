import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useMemo } from 'react';
import { FlatList, type ListRenderItem, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppText } from '../components/ui/AppText';
import { CoinPill } from '../components/ui/CoinPill';
import { ScalePressable } from '../components/ui/Pressable';
import { Screen } from '../components/ui/Screen';
import { LEVEL_SELECT_COUNT } from '../game/constants';
import { getLevelConfig } from '../game/levelConfig';
import { type LevelCardState, levelCardState } from '../game/selectors';
import type { LevelDifficulty } from '../game/types';
import { usePrismaseGame } from '../hooks/usePrismaseGame';
import { useGameStore } from '../store/gameStore';
import { colors, radius, spacing } from '../theme';

const COLUMNS = 5;
const GAP = spacing.sm + 2;
const PAD = spacing.lg;

const DIFFICULTY_COLOR: Record<LevelDifficulty, string> = {
  easy: colors.emerald,
  normal: colors.cyan,
  hard: colors.violet,
  expert: colors.pink,
};

type CardProps = {
  level: number;
  state: LevelCardState;
  size: number;
  onPress: (level: number) => void;
};

const LevelCard = memo(function LevelCard({ level, state, size, onPress }: CardProps) {
  const locked = state === 'locked';
  const accent = DIFFICULTY_COLOR[getLevelConfig(level).difficulty];
  const body = (
    <>
      {locked ? (
        <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
      ) : (
        <AppText variant="number" color={state === 'current' ? '#0B0F1A' : colors.textPrimary}>
          {level}
        </AppText>
      )}
      {state === 'completed' ? (
        <Ionicons name="checkmark" size={12} color={accent} style={styles.check} />
      ) : null}
      {!locked && state !== 'current' ? (
        <View style={[styles.dot, { backgroundColor: accent }]} />
      ) : null}
    </>
  );
  return (
    <ScalePressable
      disabled={locked}
      onPress={() => onPress(level)}
      accessibilityRole="button"
      accessibilityLabel={`Level ${level}, ${state}`}
      style={[
        styles.card,
        { width: size, height: size },
        state === 'completed' && { borderColor: `${accent}55` },
        locked && styles.locked,
      ]}
    >
      {state === 'current' ? (
        <LinearGradient
          colors={['#67E8F9', '#C4B5FD', '#F9A8D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fill, { borderRadius: radius.md }]}
        >
          {body}
        </LinearGradient>
      ) : (
        body
      )}
    </ScalePressable>
  );
});

export const LevelSelectScreen = () => {
  const game = usePrismaseGame();
  const progress = useGameStore((s) => s.progress);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 520) - PAD * 2;
  const size = Math.floor((contentWidth - GAP * (COLUMNS - 1)) / COLUMNS);
  const rowHeight = size + GAP;

  const count = Math.max(LEVEL_SELECT_COUNT, progress.unlockedLevel + COLUMNS * 4);
  const rows = useMemo(
    () => Array.from({ length: Math.ceil(count / COLUMNS) }, (_, r) => r),
    [count],
  );
  const startRow = Math.max(0, Math.floor((progress.unlockedLevel - 1) / COLUMNS) - 2);
  const completed = progress.completedLevels.length;

  const renderRow = useCallback<ListRenderItem<number>>(
    ({ item: row }) => (
      <View style={[styles.row, { height: rowHeight }]}>
        {Array.from({ length: COLUMNS }, (_, c) => {
          const level = row * COLUMNS + c + 1;
          return level <= count ? (
            <LevelCard
              key={level}
              level={level}
              size={size}
              state={levelCardState(progress, level)}
              onPress={game.startLevel}
            />
          ) : null;
        })}
      </View>
    ),
    [count, game.startLevel, progress, rowHeight, size],
  );

  return (
    <Screen title="Levels" onBack={game.goBack} right={<CoinPill />}>
      <View style={styles.summary}>
        <AppText variant="caption" color={colors.textSecondary}>
          {completed} CLEARED · {progress.unlockedLevel} UNLOCKED
        </AppText>
        <View style={styles.legend}>
          {(Object.keys(DIFFICULTY_COLOR) as LevelDifficulty[]).map((d) => (
            <View key={d} style={styles.legendItem}>
              <View
                style={[styles.dot, styles.legendDot, { backgroundColor: DIFFICULTY_COLOR[d] }]}
              />
              <AppText variant="caption" color={colors.textSecondary}>
                {d}
              </AppText>
            </View>
          ))}
        </View>
      </View>
      <FlatList
        data={rows}
        keyExtractor={(row) => `${row}`}
        renderItem={renderRow}
        getItemLayout={(_, index) => ({ length: rowHeight, offset: rowHeight * index, index })}
        initialScrollIndex={startRow}
        initialNumToRender={12}
        windowSize={7}
        contentContainerStyle={styles.list}
        style={styles.listView}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  summary: {
    paddingHorizontal: PAD,
    gap: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  legend: { flexDirection: 'row', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { position: 'relative', bottom: 0 },
  list: { paddingHorizontal: PAD, paddingBottom: spacing.xxl },
  listView: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  row: { flexDirection: 'row', gap: GAP },
  card: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.borderGlass,
  },
  fill: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  locked: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' },
  check: { position: 'absolute', top: 5, right: 6 },
  dot: { position: 'absolute', bottom: 7, width: 5, height: 5, borderRadius: 3 },
});
