import type { LevelState, PlayerProgress } from './types';

export const COSTS = { hint: 20, undo: 10, extraPrism: 40 } as const;

export const REWARDS = {
  newLevel: 10,
  replay: 2,
  skip: 0,
  daily: 25,
} as const;

export type PaidAction = 'hint' | 'undo' | 'extraPrism';

/** Coins for winning `level`: full reward the first time, a token amount on replays. */
export const winReward = (progress: PlayerProgress, level: number) =>
  progress.completedLevels.includes(level) ? REWARDS.replay : REWARDS.newLevel;

/** The rewarded "double coins" bonus pays the level's reward a second time. */
export const doubledBonus = (coinsEarned: number) => coinsEarned;

/**
 * How the player would pay for an action right now, in the order it is charged:
 * the per-level free quota, then banked boosters, then coins. Rewarded ads are always an
 * alternative to coins and are offered by the UI when one is ready.
 */
export type PaymentPlan =
  | { kind: 'free'; remaining: number }
  | { kind: 'inventory'; remaining: number }
  | { kind: 'coins'; cost: number; affordable: boolean };

const INVENTORY_KEY: Record<PaidAction, 'hints' | 'undos' | 'extraPrisms'> = {
  hint: 'hints',
  undo: 'undos',
  extraPrism: 'extraPrisms',
};

export const inventoryKey = (action: PaidAction) => INVENTORY_KEY[action];

export const paymentPlan = (
  action: PaidAction,
  level: LevelState,
  progress: PlayerProgress,
): PaymentPlan => {
  const free =
    action === 'hint' ? level.freeHintsLeft : action === 'undo' ? level.freeUndosLeft : 0;
  if (free > 0) return { kind: 'free', remaining: free };
  const banked = progress[INVENTORY_KEY[action]];
  if (banked > 0) return { kind: 'inventory', remaining: banked };
  const cost = COSTS[action];
  return { kind: 'coins', cost, affordable: progress.coins >= cost };
};
