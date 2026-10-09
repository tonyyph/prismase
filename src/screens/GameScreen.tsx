import { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LevelPlaque } from '../components/game/LevelPlaque';
import { GameActionBar } from '../components/game/GameActionBar';
import type { Highlight } from '../components/game/HintOverlay';
import { PrismBoard } from '../components/game/PrismBoard';
import { TutorialCoach } from '../components/game/TutorialCoach';
import { LevelCompleteModal } from '../components/overlays/LevelCompleteModal';
import { PauseModal } from '../components/overlays/PauseModal';
import { PurchaseSheet } from '../components/overlays/PurchaseSheet';
import { CoinPill } from '../components/ui/CoinPill';
import { IconButton } from '../components/ui/IconButton';
import { HINT_HIGHLIGHT_MS } from '../game/constants';
import { findBestMove } from '../game/hint';
import { getLevelConfig } from '../game/levelConfig';
import { canMove } from '../game/moveRules';
import { TUTORIAL_LAST_LEVEL } from '../game/progress';
import type { LevelState } from '../game/types';
import { usePrismaseGame } from '../hooks/usePrismaseGame';
import { useGameStore } from '../store/gameStore';
import { colors, spacing } from '../theme';

type Tutorial = {
  message: string;
  highlight?: string;
};

/** Soft, low-text guidance for levels 1-3; see the brief's tutorial section. */
const tutorialFor = (level: LevelState): Tutorial | null => {
  if (level.level > TUTORIAL_LAST_LEVEL || level.completedAt) return null;
  const moves = level.moveHistory.length;
  if (level.level === 1) {
    if (moves >= 3) return { message: 'Match colors to complete the level.' };
    const best = findBestMove(level.containers);
    const selected = level.selectedContainerId;
    if (!selected)
      return {
        message: 'Tap a crate to pick.',
        highlight: best?.sourceId,
      };
    const target =
      best?.sourceId === selected
        ? best.targetId
        : (
            level.containers.find(
              (c) => c.items.length && canMove(level.containers, selected, c.id),
            ) ?? level.containers.find((c) => canMove(level.containers, selected, c.id))
          )?.id;
    return { message: 'Tap another crate to place.', highlight: target };
  }
  if (level.level === 2) {
    if (moves >= 4) return { message: 'Match colors to complete the level.' };
    return { message: 'Empty crates take any color.' };
  }
  return { message: 'Stuck? Undo, or light the lantern for a hint.' };
};

const highlightsFor = (level: LevelState | null, tutorial: Tutorial | null): Highlight[] => {
  if (level?.hint) {
    return [
      { containerId: level.hint.sourceId, color: colors.gold },
      { containerId: level.hint.targetId, color: colors.gold },
    ];
  }
  return tutorial?.highlight ? [{ containerId: tutorial.highlight, color: colors.gold }] : [];
};

export const GameScreen = () => {
  const insets = useSafeAreaInsets();
  const game = usePrismaseGame();
  const level = useGameStore((s) => s.level);
  const status = useGameStore((s) => s.status);
  const purchase = useGameStore((s) => s.purchase);
  const tutorialDone = useGameStore((s) => s.progress.tutorialCompleted);
  const settings = useGameStore((s) => s.settings);
  const clearHint = useGameStore((s) => s.clearHint);

  const hintSeq = level?.hint?.seq;
  useEffect(() => {
    if (hintSeq === undefined) return undefined;
    const timer = setTimeout(clearHint, HINT_HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [hintSeq, clearHint]);

  const tutorial = useMemo(
    () => (level && !tutorialDone ? tutorialFor(level) : null),
    [level, tutorialDone],
  );

  const highlights = highlightsFor(level, tutorial);

  const onTap = useCallback((id: string) => game.selectContainer(id), [game]);

  if (!level) return null;
  const config = getLevelConfig(level.level);

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      {/* The status bar is hidden in play, so pad the HUD off the edge (and clear of a notch). */}
      <SafeAreaView
        style={[styles.safe, { paddingTop: Math.max(insets.top, 12) }]}
        edges={['bottom', 'left', 'right']}
      >
        <View style={styles.topBar}>
          <IconButton icon="pause" label="Pause" onPress={game.openPause} />
          <LevelPlaque
            level={level.level}
            detail={`${config.difficulty.toUpperCase()} · ${level.moveHistory.length} MOVES`}
          />
          <CoinPill />
        </View>

        <View style={styles.boardWrap}>
          <PrismBoard
            key={`${level.level}-${level.startedAt}`}
            containers={level.containers}
            selectedId={level.selectedContainerId}
            lastEvent={level.lastEvent}
            highlights={highlights}
            pulseHighlights={settings.hintAnimation && !settings.reducedMotion}
            reducedMotion={settings.reducedMotion}
            onTapContainer={onTap}
          />
        </View>

        {tutorial ? <TutorialCoach message={tutorial.message} /> : null}
        <GameActionBar />
      </SafeAreaView>

      {status === 'paused' ? <PauseModal /> : null}
      {status === 'levelComplete' ? <LevelCompleteModal /> : null}
      {purchase && status === 'playing' ? <PurchaseSheet action={purchase} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  boardWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});
