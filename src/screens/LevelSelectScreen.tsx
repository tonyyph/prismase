import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useMemo } from 'react';
import { FlatList, type ListRenderItem, StyleSheet, View, useWindowDimensions } from 'react-native';

import { WesternIcon } from '../components/art/WesternIcon';
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
import { brickGradient, colors, radius, spacing, woodGradient } from '../theme';

const COLUMNS = 5;
const GAP = spacing.sm + 2;
const PAD = spacing.lg;

const DIFFICULTY_COLOR: Record<LevelDifficulty, string> = {
  easy: '#7fa64a',
  normal: '#2a9d8f',
  hard: '#cf6420',
  expert: '#c0392b',
};

type CardProps = {
  level: number;
  state: LevelCardState;
  size: number;
  onPress: (level: number) => void;
};

/** Level cards are wooden tiles; the next level to play is a red painted plank. */
const LevelCard = memo(function LevelCard({ level, state, size, onPress }: CardProps) {
  const locked = state === 'locked';
  const current = state === 'current';
  const accent = DIFFICULTY_COLOR[getLevelConfig(level).difficulty];
  return (
    <ScalePressable
      disabled={locked}
      onPress={() => onPress(level)}
      accessibilityRole="button"
      accessibilityLabel={`Level ${level}, ${state}`}
      style={[styles.card, { width: size, height: size }, locked && styles.locked]}
    >
      {locked ? (
        <View style={[styles.face, styles.lockedFace]}>
          <WesternIcon name="lock" size={18} color={colors.textMuted} />
        </View>
      ) : (
        <LinearGradient colors={current ? brickGradient : woodGradient} style={styles.face}>
          <AppText variant="title" style={styles.number}>
            {level}
          </AppText>
          {state === 'completed' ? (
            <View style={styles.check}>
              <WesternIcon name="star" size={13} color={colors.brassLight} />
            </View>
          ) : null}
          <View style={[styles.dot, { backgroundColor: accent }]} />
        </LinearGradient>
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
        <View style={styles.summaryBoard}>
          <AppText variant="caption" color={colors.ink}>
            {completed} BOUNTIES · {progress.unlockedLevel} UNLOCKED
          </AppText>
        </View>
        <View style={styles.legend}>
          {(Object.keys(DIFFICULTY_COLOR) as LevelDifficulty[]).map((d) => (
            <View key={d} style={styles.legendItem}>
              <View
                style={[styles.dot, styles.legendDot, { backgroundColor: DIFFICULTY_COLOR[d] }]}
              />
              <AppText variant="caption" color={colors.textPrimary}>
                {d.toUpperCase()}
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
  summaryBoard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    backgroundColor: colors.parchment,
  },
  list: { paddingHorizontal: PAD, paddingBottom: spacing.xxl },
  listView: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  row: { flexDirection: 'row', gap: GAP },
  card: { borderRadius: radius.sm + 2, backgroundColor: '#2e180b', paddingBottom: 3 },
  face: {
    flex: 1,
    borderRadius: radius.sm + 2,
    borderWidth: 1.5,
    borderColor: '#3a1f0e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedFace: { backgroundColor: '#3a2214', borderColor: '#2b170c' },
  locked: { opacity: 0.85 },
  number: { fontSize: 22, lineHeight: 31 },
  check: { position: 'absolute', top: 4, right: 5 },
  dot: { position: 'absolute', bottom: 6, width: 6, height: 6, borderRadius: 3 },
});
