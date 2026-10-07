import { DEFAULT_PROGRESS } from '../constants';
import { COSTS, REWARDS, paymentPlan, winReward } from '../economy';
import {
  applySkip,
  applyWin,
  canClaimDaily,
  claimDaily,
  consumeInventory,
  sanitizeProgress,
  spendCoins,
} from '../progress';
import { createLevelState } from '../reducer';
import type { PlayerProgress } from '../types';

const progress = (patch: Partial<PlayerProgress> = {}): PlayerProgress => ({
  ...DEFAULT_PROGRESS,
  ...patch,
});

describe('win rewards', () => {
  it('pays the full reward on a first clear and unlocks the next level', () => {
    const result = applyWin(progress({ coins: 0 }), 1);
    expect(result.coinsEarned).toBe(REWARDS.newLevel);
    expect(result.firstClear).toBe(true);
    expect(result.progress).toMatchObject({
      coins: 10,
      unlockedLevel: 2,
      currentLevel: 2,
      completedLevels: [1],
      totalWins: 1,
    });
  });

  it('pays less on replays and never re-locks', () => {
    const p = progress({ coins: 0, unlockedLevel: 9, completedLevels: [1, 2, 3] });
    expect(winReward(p, 2)).toBe(REWARDS.replay);
    const result = applyWin(p, 2);
    expect(result.progress.coins).toBe(2);
    expect(result.progress.unlockedLevel).toBe(9);
    expect(result.progress.completedLevels).toEqual([1, 2, 3]);
  });

  it('completes the tutorial on level 3', () => {
    expect(applyWin(progress(), 2).progress.tutorialCompleted).toBe(false);
    expect(applyWin(progress(), 3).progress.tutorialCompleted).toBe(true);
  });

  it('skipping unlocks the next level for no coins', () => {
    const p = applySkip(progress({ coins: 5, unlockedLevel: 4 }), 4);
    expect(p).toMatchObject({ coins: 5, unlockedLevel: 5, currentLevel: 5 });
  });
});

describe('spending', () => {
  it('cannot overdraw', () => {
    expect(spendCoins(progress({ coins: 5 }), COSTS.undo)).toBeNull();
    expect(spendCoins(progress({ coins: 25 }), COSTS.hint)?.coins).toBe(5);
  });

  it('consumes banked boosters', () => {
    expect(consumeInventory(progress({ hints: 1 }), 'hint')?.hints).toBe(0);
    expect(consumeInventory(progress({ hints: 0 }), 'hint')).toBeNull();
  });
});

describe('paymentPlan', () => {
  const level = createLevelState(30, [], 0);

  it('uses the free quota first', () => {
    expect(paymentPlan('undo', level, progress())).toEqual({ kind: 'free', remaining: 3 });
  });

  it('then banked boosters, then coins', () => {
    const noFree = { ...level, freeUndosLeft: 0 };
    expect(paymentPlan('undo', noFree, progress({ undos: 2 }))).toEqual({
      kind: 'inventory',
      remaining: 2,
    });
    expect(paymentPlan('undo', noFree, progress({ coins: 3 }))).toEqual({
      kind: 'coins',
      cost: COSTS.undo,
      affordable: false,
    });
  });

  it('gives a free hint only on early levels and never a free extra prism', () => {
    expect(createLevelState(1, [], 0).freeHintsLeft).toBe(1);
    expect(level.freeHintsLeft).toBe(0);
    expect(paymentPlan('extraPrism', createLevelState(1, [], 0), progress()).kind).toBe('coins');
  });
});

describe('daily reward', () => {
  const day = new Date(2026, 9, 7, 9).getTime();

  it('can be claimed once per local day', () => {
    const claimed = claimDaily(progress({ coins: 0 }), day)!;
    expect(claimed.coins).toBe(REWARDS.daily);
    expect(canClaimDaily(claimed, day + 3600_000)).toBe(false);
    expect(claimDaily(claimed, day + 3600_000)).toBeNull();
    expect(canClaimDaily(claimed, day + 24 * 3600_000)).toBe(true);
  });
});

describe('sanitizeProgress', () => {
  it('recovers from garbage', () => {
    expect(sanitizeProgress('nope')).toEqual(DEFAULT_PROGRESS);
    expect(sanitizeProgress(null)).toEqual(DEFAULT_PROGRESS);
  });

  it('repairs inconsistent fields', () => {
    const p = sanitizeProgress({
      coins: -5,
      unlockedLevel: 1,
      currentLevel: 99,
      completedLevels: [3, 1, 'x', 3, 2],
    });
    expect(p.coins).toBe(DEFAULT_PROGRESS.coins);
    expect(p.completedLevels).toEqual([1, 2, 3]);
    expect(p.unlockedLevel).toBe(4);
    expect(p.currentLevel).toBe(4);
  });
});
