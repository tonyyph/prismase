import { isContainerComplete, isLevelComplete, listValidMoves } from './moveRules';
import type { ContainerState, Move } from './types';

/**
 * Depth-first solver over a compact board encoding. Not optimal (it does not look for the
 * shortest solution); it only needs to prove a board solvable fast enough to run on a phone,
 * and to suggest a next move that keeps the board solvable.
 */

type Board = number[][];

const encode = (containers: readonly ContainerState[]) => {
  const colorIndex = new Map<string, number>();
  const board: Board = containers.map((c) =>
    c.items.map((item) => {
      let index = colorIndex.get(item.colorId);
      if (index === undefined) {
        index = colorIndex.size;
        colorIndex.set(item.colorId, index);
      }
      return index;
    }),
  );
  return { board, capacities: containers.map((c) => c.capacity) };
};

/** Containers are interchangeable, so sorting them makes equivalent boards share a key. */
const keyOf = (board: Board) =>
  board
    .map((stack) => stack.join(','))
    .sort()
    .join('|');

const isUniform = (stack: number[]) => stack.every((v) => v === stack[0]);

/** Length of the same-colour run at the top of a stack. */
const topRun = (stack: number[]) => {
  if (!stack.length) return 0;
  const top = stack[stack.length - 1];
  let run = 0;
  for (let i = stack.length - 1; i >= 0 && stack[i] === top; i -= 1) run += 1;
  return run;
};

const solvedBoard = (board: Board, capacities: number[]) =>
  board.every((s, i) => s.length === 0 || (s.length === capacities[i] && isUniform(s)));

type Candidate = { from: number; to: number; score: number };

/** Legal, non-pointless moves ordered best first. */
const candidates = (board: Board, capacities: number[]): Candidate[] => {
  const out: Candidate[] = [];
  for (let from = 0; from < board.length; from += 1) {
    const source = board[from];
    if (!source.length) continue;
    const color = source[source.length - 1];
    const sourceUniform = isUniform(source);
    const sourceRun = topRun(source);
    let triedEmpty = false;
    for (let to = 0; to < board.length; to += 1) {
      if (to === from) continue;
      const target = board[to];
      if (target.length >= capacities[to]) continue;
      if (target.length && target[target.length - 1] !== color) continue;

      let score: number;
      if (!target.length) {
        // Moving a finished-looking stack into an empty prism changes nothing.
        if (sourceUniform) continue;
        // All empty prisms are equivalent; trying one is enough.
        if (triedEmpty) continue;
        triedEmpty = true;
        score = 10 + (sourceRun === source.length - 1 ? 5 : 0) - sourceRun;
      } else {
        const targetUniform = isUniform(target);
        // Pulling an item out of a clean stack onto a mixed one is never progress.
        if (sourceUniform && !targetUniform) continue;
        if (sourceUniform && targetUniform && source.length > target.length) continue;
        const completes = targetUniform && target.length + 1 === capacities[to];
        score = completes ? 100 : 40 + topRun(target) * 5 + (targetUniform ? 15 : 0);
        if (source.length === 1) score += 6;
      }
      out.push({ from, to, score });
    }
  }
  return out.sort((a, b) => b.score - a.score);
};

export type SolveResult = { solved: boolean; moves: Move[]; explored: number };

export const solve = (containers: readonly ContainerState[], maxNodes = 40000): SolveResult => {
  const { board, capacities } = encode(containers);
  const ids = containers.map((c) => c.id);
  const seen = new Set<string>();
  const path: Candidate[] = [];
  let explored = 0;

  const search = (): boolean => {
    if (solvedBoard(board, capacities)) return true;
    if (explored >= maxNodes) return false;
    const key = keyOf(board);
    if (seen.has(key)) return false;
    seen.add(key);
    explored += 1;

    for (const move of candidates(board, capacities)) {
      const value = board[move.from].pop()!;
      board[move.to].push(value);
      path.push(move);
      if (search()) return true;
      path.pop();
      board[move.to].pop();
      board[move.from].push(value);
      if (explored >= maxNodes) return false;
    }
    return false;
  };

  const solved = search();
  return {
    solved,
    explored,
    moves: solved ? path.map(({ from, to }) => ({ sourceId: ids[from], targetId: ids[to] })) : [],
  };
};

/** Same ordering the solver uses, exposed for the heuristic hint fallback. */
export const rankMoves = (containers: readonly ContainerState[]): Move[] => {
  const { board, capacities } = encode(containers);
  return candidates(board, capacities).map(({ from, to }) => ({
    sourceId: containers[from].id,
    targetId: containers[to].id,
  }));
};

export type LevelValidation = { valid: boolean; problems: string[] };

/** Checks colour counts, that the board is not already solved, has a move, and is solvable. */
export const validateLevel = (containers: readonly ContainerState[]): LevelValidation => {
  const problems: string[] = [];
  const counts = new Map<string, number>();
  for (const container of containers) {
    if (container.items.length > container.capacity) problems.push(`${container.id} overfilled`);
    for (const item of container.items) {
      counts.set(item.colorId, (counts.get(item.colorId) ?? 0) + 1);
    }
  }
  const capacity = containers[0]?.capacity ?? 0;
  counts.forEach((count, colorId) => {
    if (count !== capacity) problems.push(`${colorId} has ${count} items`);
  });
  const ids = new Set(containers.flatMap((c) => c.items.map((i) => i.id)));
  if (ids.size !== [...counts.values()].reduce((a, b) => a + b, 0)) {
    problems.push('duplicate item ids');
  }
  if (isLevelComplete(containers)) problems.push('already solved');
  if (containers.some(isContainerComplete)) problems.push('starts with a complete prism');
  if (!listValidMoves(containers).length) problems.push('no legal move');
  if (!problems.length && !solve(containers).solved) problems.push('not provably solvable');
  return { valid: problems.length === 0, problems };
};
