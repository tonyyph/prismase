import { isContainerComplete } from './moveRules';
import type { LevelState, PlayerProgress } from './types';

export type LevelCardState = 'locked' | 'current' | 'completed' | 'unlocked';

export const levelCardState = (progress: PlayerProgress, level: number): LevelCardState => {
  if (level > progress.unlockedLevel) return 'locked';
  if (level === progress.unlockedLevel && !progress.completedLevels.includes(level))
    return 'current';
  if (progress.completedLevels.includes(level)) return 'completed';
  return 'unlocked';
};

export const completedContainerIds = (state: LevelState) =>
  new Set(state.containers.filter(isContainerComplete).map((c) => c.id));

export const moveCount = (state: LevelState) => state.moveHistory.length;

export const elapsedMs = (state: LevelState, now: number) =>
  (state.completedAt ?? now) - state.startedAt;
