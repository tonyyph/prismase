import { createRandom, randomInt } from '../utils/seedRandom';
import { shuffle } from '../utils/shuffle';
import { PRISM_COLORS } from './constants';
import { getLevelConfig } from './levelConfig';
import { isContainerComplete, isLevelComplete, listValidMoves } from './moveRules';
import { validateLevel } from './solverValidator';
import type { ContainerState, LevelConfig, PrismItem } from './types';

export type GeneratedLevel = {
  config: LevelConfig;
  containers: ContainerState[];
  /** How the board was built, kept for debugging generator issues by seed. */
  method: 'deal' | 'reverse';
  attempts: number;
};

const containerId = (index: number) => `c${index}`;

const emptyContainers = (count: number, from: number, capacity: number): ContainerState[] =>
  Array.from({ length: count }, (_, i) => ({
    id: containerId(from + i),
    items: [],
    capacity,
  }));

/** One full, single-colour container per colour, followed by the empty prisms. */
export const generateSolvedContainers = (config: LevelConfig): ContainerState[] => {
  const filled = PRISM_COLORS.slice(0, config.colorCount).map((color, index) => ({
    id: containerId(index),
    capacity: config.containerCapacity,
    items: Array.from({ length: config.containerCapacity }, (_, n): PrismItem => ({
      id: `${color.id}-${n}`,
      colorId: color.id,
    })),
  }));
  return [
    ...filled,
    ...emptyContainers(config.emptyContainerCount, config.colorCount, config.containerCapacity),
  ];
};

/**
 * Scrambles a solved board by playing legal moves backwards. A backward move takes the top
 * item of a stack and puts it on any stack with room, but only when the item it leaves behind
 * is of the same colour (or nothing), because only then could the forward move have happened.
 * Every board produced this way is solvable by replaying the moves forwards.
 */
export const scrambleByReverseMoves = (
  solved: readonly ContainerState[],
  seed: string,
  moveCount: number,
): ContainerState[] => {
  const random = createRandom(`${seed}:reverse`);
  const board = solved.map((c) => ({ ...c, items: [...c.items] }));
  let lastTarget = -1;

  for (let step = 0; step < moveCount || isLevelComplete(board); step += 1) {
    const options: [number, number][] = [];
    board.forEach((from, fi) => {
      const item = from.items[from.items.length - 1];
      if (!item || fi === lastTarget) return;
      const below = from.items[from.items.length - 2];
      if (below && below.colorId !== item.colorId) return;
      board.forEach((to, ti) => {
        if (ti !== fi && to.items.length < to.capacity) options.push([fi, ti]);
      });
    });
    if (!options.length || step > moveCount * 4) break;
    const [fi, ti] = options[randomInt(random, options.length)];
    board[ti].items.push(board[fi].items.pop()!);
    lastTarget = ti;
  }
  return board;
};

/** Deals every item at random into full containers, leaving the empty prisms empty. */
const dealRandom = (config: LevelConfig, attempt: number): ContainerState[] => {
  const random = createRandom(`${config.seed}:deal:${attempt}`);
  const items = shuffle(
    generateSolvedContainers(config).flatMap((c) => c.items),
    random,
  );
  const filled = Array.from({ length: config.colorCount }, (_, i) => ({
    id: containerId(i),
    capacity: config.containerCapacity,
    items: items.slice(i * config.containerCapacity, (i + 1) * config.containerCapacity),
  }));
  return [
    ...filled,
    ...emptyContainers(config.emptyContainerCount, config.colorCount, config.containerCapacity),
  ];
};

const MAX_DEAL_ATTEMPTS = 25;

/**
 * Prefers a random deal (full stacks look and play best) that the solver proves solvable.
 * If no deal passes, falls back to a reverse-move scramble, which is solvable by construction.
 */
export const generateLevel = (config: LevelConfig): GeneratedLevel => {
  for (let attempt = 0; attempt < MAX_DEAL_ATTEMPTS; attempt += 1) {
    const containers = dealRandom(config, attempt);
    if (validateLevel(containers).valid) {
      return { config, containers, method: 'deal', attempts: attempt + 1 };
    }
  }
  const solved = generateSolvedContainers(config);
  let containers = scrambleByReverseMoves(solved, config.seed, config.colorCount * 30);
  // A complete stack left over from the scramble is harmless but looks unfinished; keep going.
  for (let extra = 1; containers.some(isContainerComplete) && extra <= 10; extra += 1) {
    containers = scrambleByReverseMoves(
      containers,
      `${config.seed}:${extra}`,
      config.colorCount * 10,
    );
  }
  if (!listValidMoves(containers).length || isLevelComplete(containers)) {
    containers = scrambleByReverseMoves(solved, `${config.seed}:retry`, config.colorCount * 40);
  }
  return { config, containers, method: 'reverse', attempts: MAX_DEAL_ATTEMPTS };
};

const cache = new Map<number, GeneratedLevel>();

/** Generated levels are deterministic, so they are memoised per level number. */
export const getLevel = (level: number): GeneratedLevel => {
  const cached = cache.get(level);
  if (cached) return cached;
  const generated = generateLevel(getLevelConfig(level));
  cache.set(level, generated);
  if (cache.size > 30) cache.delete(cache.keys().next().value!);
  return generated;
};
