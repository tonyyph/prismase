import { FREE_UNDOS_PER_LEVEL } from '../constants';
import { canMove } from '../moveRules';
import { createLevelState, levelReducer } from '../reducer';
import type { LevelState } from '../types';
import { board, colorsOf } from './helpers';

const start = (stacks: string[]) => createLevelState(7, board(stacks), 1000);
const tap = (state: LevelState, containerId: string, now = 2000) =>
  levelReducer(state, { type: 'tapContainer', containerId, now });

describe('tapping', () => {
  it('selects, then moves on the second tap', () => {
    let s = start(['ab', 'b', '']);
    s = tap(s, 'c0');
    expect(s.selectedContainerId).toBe('c0');
    expect(s.lastEvent?.kind).toBe('select');
    s = tap(s, 'c1');
    expect(colorsOf(s.containers)).toEqual(['a', 'bb', '']);
    expect(s.selectedContainerId).toBeUndefined();
    expect(s.moveHistory).toHaveLength(1);
    expect(s.lastEvent?.kind).toBe('move');
  });

  it('tapping the selection again deselects', () => {
    const s = tap(tap(start(['ab', '']), 'c0'), 'c0');
    expect(s.selectedContainerId).toBeUndefined();
    expect(s.lastEvent?.kind).toBe('deselect');
  });

  it('an invalid target reports invalid and leaves the board alone', () => {
    const s = tap(tap(start(['ab', 'ba']), 'c0'), 'c1');
    expect(colorsOf(s.containers)).toEqual(['ab', 'ba']);
    expect(s.lastEvent).toMatchObject({ kind: 'invalid', containerId: 'c1' });
  });

  it('selecting an empty container is invalid', () => {
    expect(tap(start(['ab', '']), 'c1').lastEvent?.kind).toBe('invalid');
  });

  it('event seq increases every time', () => {
    const a = tap(start(['ab', '']), 'c1');
    const b = tap(a, 'c1');
    expect(b.lastEvent!.seq).toBe(a.lastEvent!.seq + 1);
  });
});

describe('completion', () => {
  it('marks the level complete and then ignores further input', () => {
    let s = start(['aaab', 'bbba', '']);
    for (const [from, to] of [
      ['c0', 'c2'],
      ['c1', 'c0'],
      ['c2', 'c1'],
    ]) {
      s = levelReducer(s, { type: 'moveItem', sourceId: from, targetId: to, now: 5000 });
    }
    expect(colorsOf(s.containers)).toEqual(['aaaa', 'bbbb', '']);
    expect(s.completedAt).toBe(5000);
    expect(s.lastEvent).toMatchObject({
      kind: 'move',
      levelComplete: true,
      completedContainer: true,
    });
    expect(levelReducer(s, { type: 'undoMove', useFreeQuota: true })).toBe(s);
    expect(tap(s, 'c0')).toBe(s);
  });
});

describe('undoMove', () => {
  it('reverts the last move and spends free quota when asked', () => {
    let s = tap(tap(start(['ab', 'b', '']), 'c0'), 'c1');
    s = levelReducer(s, { type: 'undoMove', useFreeQuota: true });
    expect(colorsOf(s.containers)).toEqual(['ab', 'b', '']);
    expect(s.moveHistory).toHaveLength(0);
    expect(s.freeUndosLeft).toBe(FREE_UNDOS_PER_LEVEL - 1);
  });

  it('paid undo leaves the free quota alone', () => {
    let s = tap(tap(start(['ab', '']), 'c0'), 'c1');
    s = levelReducer(s, { type: 'undoMove', useFreeQuota: false });
    expect(s.freeUndosLeft).toBe(FREE_UNDOS_PER_LEVEL);
  });

  it('undoes several moves in reverse order', () => {
    let s = start(['abc', '', '']);
    s = levelReducer(s, { type: 'moveItem', sourceId: 'c0', targetId: 'c1', now: 1 });
    s = levelReducer(s, { type: 'moveItem', sourceId: 'c0', targetId: 'c2', now: 2 });
    s = levelReducer(s, { type: 'undoMove', useFreeQuota: true });
    s = levelReducer(s, { type: 'undoMove', useFreeQuota: true });
    expect(colorsOf(s.containers)).toEqual(['abc', '', '']);
  });

  it('does nothing with an empty history', () => {
    const s = start(['ab', '']);
    expect(levelReducer(s, { type: 'undoMove', useFreeQuota: true })).toBe(s);
  });
});

describe('hint', () => {
  it('highlights a legal move and spends the free hint', () => {
    const s = levelReducer(start(['aab', 'bba', 'aabb', '']), {
      type: 'useHint',
      useFreeQuota: true,
    });
    expect(s.hint).toBeDefined();
    expect(canMove(s.containers, s.hint!.sourceId, s.hint!.targetId)).toBe(true);
  });

  it('is cleared by the next move', () => {
    let s = levelReducer(start(['ab', 'b', '']), { type: 'useHint', useFreeQuota: false });
    s = levelReducer(s, { type: 'moveItem', sourceId: 'c0', targetId: 'c2', now: 1 });
    expect(s.hint).toBeUndefined();
  });
});

describe('extra prism', () => {
  it('adds one empty container, once', () => {
    let s = levelReducer(start(['ab', 'ba']), { type: 'addExtraPrism' });
    expect(s.containers).toHaveLength(3);
    expect(s.containers[2]).toMatchObject({ items: [], isExtra: true, capacity: 4 });
    expect(s.extraPrismUsed).toBe(true);
    expect(levelReducer(s, { type: 'addExtraPrism' })).toBe(s);
  });
});

describe('restart', () => {
  it('restores the initial board, history and quotas, and drops the extra prism', () => {
    let s = start(['ab', 'b', '']);
    s = tap(tap(s, 'c0'), 'c1');
    s = levelReducer(s, { type: 'addExtraPrism' });
    s = levelReducer(s, { type: 'undoMove', useFreeQuota: true });
    s = levelReducer(s, { type: 'restartLevel', now: 9000 });
    expect(colorsOf(s.containers)).toEqual(['ab', 'b', '']);
    expect(s.moveHistory).toEqual([]);
    expect(s.freeUndosLeft).toBe(FREE_UNDOS_PER_LEVEL);
    expect(s.extraPrismUsed).toBe(false);
    expect(s.startedAt).toBe(9000);
    expect(s.restarts).toBe(1);
  });
});
