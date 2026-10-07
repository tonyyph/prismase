import { dayKey } from '../utils/time';
import { DEFAULT_PROGRESS } from './constants';
import { type PaidAction, REWARDS, inventoryKey, winReward } from './economy';
import type { PlayerProgress } from './types';

export const TUTORIAL_LAST_LEVEL = 3;

export type WinResult = { progress: PlayerProgress; coinsEarned: number; firstClear: boolean };

const unlockAfter = (progress: PlayerProgress, level: number): PlayerProgress => ({
  ...progress,
  unlockedLevel: Math.max(progress.unlockedLevel, level + 1),
  currentLevel: level + 1,
  completedLevels: progress.completedLevels.includes(level)
    ? progress.completedLevels
    : [...progress.completedLevels, level].sort((a, b) => a - b),
  tutorialCompleted: progress.tutorialCompleted || level >= TUTORIAL_LAST_LEVEL,
});

export const applyWin = (progress: PlayerProgress, level: number): WinResult => {
  const firstClear = !progress.completedLevels.includes(level);
  const coinsEarned = winReward(progress, level);
  return {
    firstClear,
    coinsEarned,
    progress: {
      ...unlockAfter(progress, level),
      coins: progress.coins + coinsEarned,
      totalWins: progress.totalWins + 1,
    },
  };
};

/** Skipping (rewarded ad only) unlocks the next level and counts the level as cleared, for no coins. */
export const applySkip = (progress: PlayerProgress, level: number): PlayerProgress => ({
  ...unlockAfter(progress, level),
  coins: progress.coins + REWARDS.skip,
});

export const addCoins = (progress: PlayerProgress, amount: number): PlayerProgress => ({
  ...progress,
  coins: Math.max(0, progress.coins + amount),
});

/** Returns null when the player cannot afford it, so callers cannot overdraw. */
export const spendCoins = (progress: PlayerProgress, amount: number): PlayerProgress | null =>
  progress.coins >= amount ? { ...progress, coins: progress.coins - amount } : null;

export const consumeInventory = (
  progress: PlayerProgress,
  action: PaidAction,
): PlayerProgress | null => {
  const key = inventoryKey(action);
  return progress[key] > 0 ? { ...progress, [key]: progress[key] - 1 } : null;
};

export const canClaimDaily = (progress: PlayerProgress, now: number) =>
  progress.lastDailyRewardDay !== dayKey(now);

export const claimDaily = (progress: PlayerProgress, now: number): PlayerProgress | null =>
  canClaimDaily(progress, now)
    ? { ...progress, coins: progress.coins + REWARDS.daily, lastDailyRewardDay: dayKey(now) }
    : null;

export const recordLevelStart = (progress: PlayerProgress, level: number): PlayerProgress => ({
  ...progress,
  currentLevel: level,
  gamesPlayed: progress.gamesPlayed + 1,
});

const nonNegativeInt = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;

/** Accepts anything read from storage and returns a well-formed progress object. */
export const sanitizeProgress = (raw: unknown): PlayerProgress => {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PROGRESS };
  const r = raw as Record<string, unknown>;
  const completedLevels = Array.isArray(r.completedLevels)
    ? [...new Set(r.completedLevels.filter((n): n is number => Number.isInteger(n) && n > 0))].sort(
        (a, b) => a - b,
      )
    : [];
  const unlockedLevel = Math.max(
    1,
    nonNegativeInt(r.unlockedLevel, 1),
    (completedLevels[completedLevels.length - 1] ?? 0) + 1,
  );
  const currentLevel = Math.min(unlockedLevel, Math.max(1, nonNegativeInt(r.currentLevel, 1)));
  return {
    currentLevel,
    unlockedLevel,
    completedLevels,
    coins: nonNegativeInt(r.coins, DEFAULT_PROGRESS.coins),
    hints: nonNegativeInt(r.hints, 0),
    undos: nonNegativeInt(r.undos, 0),
    extraPrisms: nonNegativeInt(r.extraPrisms, 0),
    gamesPlayed: nonNegativeInt(r.gamesPlayed, 0),
    totalWins: nonNegativeInt(r.totalWins, 0),
    tutorialCompleted: r.tutorialCompleted === true,
    lastDailyRewardDay: typeof r.lastDailyRewardDay === 'string' ? r.lastDailyRewardDay : undefined,
  };
};
