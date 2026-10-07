import { getLevelConfig } from '../levelConfig';
import { generateLevel } from '../levelGenerator';
import { findBestMove } from '../hint';
import { canMove, isLevelComplete, moveItem } from '../moveRules';
import { board } from './helpers';

it('prefers a move that completes a container', () => {
  const containers = board(['bbba', 'aaa', 'b']);
  expect(findBestMove(containers)).toEqual({ sourceId: 'c0', targetId: 'c1' });
});

it('returns a valid move on generated levels', () => {
  for (const level of [1, 10, 50, 100, 150]) {
    const { containers } = generateLevel(getLevelConfig(level));
    const move = findBestMove(containers)!;
    expect(canMove(containers, move.sourceId, move.targetId)).toBe(true);
  }
});

it('following hints alone solves a level', () => {
  let { containers } = generateLevel(getLevelConfig(30));
  for (let i = 0; i < 300 && !isLevelComplete(containers); i += 1) {
    const move = findBestMove(containers)!;
    containers = moveItem(containers, move.sourceId, move.targetId);
  }
  expect(isLevelComplete(containers)).toBe(true);
});

it('still suggests a legal move on a board the solver gives up on', () => {
  const stuck = board(['abab', 'baba', 'a']);
  const move = findBestMove(stuck);
  expect(move && canMove(stuck, move.sourceId, move.targetId)).toBe(true);
});

it('returns undefined when no move exists', () => {
  expect(findBestMove(board(['abab', 'baba']))).toBeUndefined();
});
