import {
  canMove,
  isContainerComplete,
  isLevelComplete,
  listValidMoves,
  moveItem,
  revertMove,
} from '../moveRules';
import { board, colorsOf } from './helpers';

describe('canMove', () => {
  it('allows moving onto an empty container', () => {
    expect(canMove(board(['ab', '']), 'c0', 'c1')).toBe(true);
  });

  it('allows moving onto a matching top', () => {
    expect(canMove(board(['ab', 'ab']), 'c0', 'c1')).toBe(true);
  });

  it('rejects a mismatched top', () => {
    expect(canMove(board(['ab', 'ba']), 'c0', 'c1')).toBe(false);
  });

  it('rejects a full target even when colours match', () => {
    expect(canMove(board(['a', 'aaaa']), 'c0', 'c1')).toBe(false);
  });

  it('rejects an empty source', () => {
    expect(canMove(board(['', 'a']), 'c0', 'c1')).toBe(false);
  });

  it('rejects moving into itself', () => {
    expect(canMove(board(['a', '']), 'c0', 'c0')).toBe(false);
  });

  it('rejects unknown container ids', () => {
    expect(canMove(board(['a', '']), 'c0', 'nope')).toBe(false);
  });
});

describe('moveItem', () => {
  it('moves exactly the top item', () => {
    expect(colorsOf(moveItem(board(['abb', 'b']), 'c0', 'c1'))).toEqual(['ab', 'bb']);
  });

  it('does not mutate the input', () => {
    const before = board(['ab', '']);
    const snapshot = JSON.stringify(before);
    moveItem(before, 'c0', 'c1');
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it('returns an unchanged board for an illegal move', () => {
    expect(colorsOf(moveItem(board(['ab', 'ba']), 'c0', 'c1'))).toEqual(['ab', 'ba']);
  });

  it('keeps untouched containers by reference', () => {
    const before = board(['a', '', 'bb']);
    expect(moveItem(before, 'c0', 'c1')[2]).toBe(before[2]);
  });
});

describe('revertMove', () => {
  it('puts the item back even where the colour rule would forbid it', () => {
    const after = moveItem(board(['ba', '']), 'c0', 'c1');
    expect(colorsOf(revertMove(after, { sourceId: 'c0', targetId: 'c1' }))).toEqual(['ba', '']);
  });
});

describe('completion', () => {
  it('a full single-colour container is complete', () => {
    expect(isContainerComplete(board(['aaaa'])[0])).toBe(true);
  });

  it('a partial or mixed container is not', () => {
    expect(isContainerComplete(board(['aaa'])[0])).toBe(false);
    expect(isContainerComplete(board(['aaab'])[0])).toBe(false);
    expect(isContainerComplete(board([''])[0])).toBe(false);
  });

  it('a level is complete when every non-empty container is complete', () => {
    expect(isLevelComplete(board(['aaaa', 'bbbb', '', '']))).toBe(true);
    expect(isLevelComplete(board(['aaab', 'bbba', '', '']))).toBe(false);
    expect(isLevelComplete(board(['aa', 'aa', 'bbbb']))).toBe(false);
  });
});

it('lists every legal move', () => {
  expect(listValidMoves(board(['ab', 'b', '']))).toEqual([
    { sourceId: 'c0', targetId: 'c1' },
    { sourceId: 'c0', targetId: 'c2' },
    { sourceId: 'c1', targetId: 'c0' },
    { sourceId: 'c1', targetId: 'c2' },
  ]);
});
