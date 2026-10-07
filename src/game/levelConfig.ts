import { CONTAINER_CAPACITY, MAX_COLORS } from './constants';
import type { LevelConfig, LevelDifficulty } from './types';

const band = (level: number, start: number, span: number, from: number, to: number) =>
  Math.min(to, from + Math.floor((level - start) / span));

/** Difficulty curve from the product brief. Pure and deterministic per level. */
export const getLevelConfig = (rawLevel: number): LevelConfig => {
  const level = Math.max(1, Math.floor(rawLevel));
  let difficulty: LevelDifficulty;
  let colorCount: number;
  let emptyContainerCount = 2;

  if (level <= 5) {
    difficulty = 'easy';
    colorCount = level <= 3 ? 3 : 4;
  } else if (level <= 20) {
    difficulty = 'easy';
    colorCount = level <= 12 ? 4 : 5;
  } else if (level <= 60) {
    difficulty = 'normal';
    colorCount = band(level, 21, 14, 5, 7);
  } else if (level <= 120) {
    difficulty = 'hard';
    colorCount = band(level, 61, 20, 7, 9);
  } else {
    difficulty = 'expert';
    colorCount = band(level, 121, 30, 9, MAX_COLORS);
    // Big boards get a third free prism so they stay fair rather than tedious.
    if (colorCount >= 11) emptyContainerCount = 3;
  }

  return {
    level,
    colorCount,
    containerCapacity: CONTAINER_CAPACITY,
    emptyContainerCount,
    difficulty,
    seed: `prismase-${level}`,
  };
};

export const isTutorialLevel = (level: number) => level <= 3;
