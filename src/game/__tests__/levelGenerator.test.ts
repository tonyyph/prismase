import { CONTAINER_CAPACITY } from '../constants';
import { getLevelConfig } from '../levelConfig';
import { generateLevel, generateSolvedContainers, scrambleByReverseMoves } from '../levelGenerator';
import { isLevelComplete, listValidMoves } from '../moveRules';
import { solve, validateLevel } from '../solverValidator';

describe('getLevelConfig', () => {
  it.each([
    [1, 'easy', 3, 2],
    [5, 'easy', 4, 2],
    [6, 'easy', 4, 2],
    [20, 'easy', 5, 2],
    [21, 'normal', 5, 2],
    [60, 'normal', 7, 2],
    [61, 'hard', 7, 2],
    [120, 'hard', 9, 2],
    [121, 'expert', 9, 2],
    [500, 'expert', 12, 3],
  ] as const)(
    'level %i is %s with %i colours and %i empties',
    (level, difficulty, colors, empties) => {
      const config = getLevelConfig(level);
      expect(config).toMatchObject({
        difficulty,
        colorCount: colors,
        emptyContainerCount: empties,
        containerCapacity: CONTAINER_CAPACITY,
      });
    },
  );

  it('keeps colour counts inside each band', () => {
    for (let level = 1; level <= 400; level += 1) {
      const { colorCount, difficulty } = getLevelConfig(level);
      const [min, max] = { easy: [3, 5], normal: [5, 7], hard: [7, 9], expert: [9, 12] }[
        difficulty
      ];
      expect(colorCount).toBeGreaterThanOrEqual(min);
      expect(colorCount).toBeLessThanOrEqual(max);
    }
  });

  it('never gets easier as levels go up', () => {
    for (let level = 2; level <= 400; level += 1) {
      expect(getLevelConfig(level).colorCount).toBeGreaterThanOrEqual(
        getLevelConfig(level - 1).colorCount,
      );
    }
  });

  it('clamps nonsense input to level 1', () => {
    expect(getLevelConfig(0).level).toBe(1);
    expect(getLevelConfig(-3).level).toBe(1);
  });
});

describe('generateLevel', () => {
  it('is deterministic per seed', () => {
    const a = generateLevel(getLevelConfig(42));
    const b = generateLevel(getLevelConfig(42));
    expect(a.containers).toEqual(b.containers);
    expect(generateLevel(getLevelConfig(43)).containers).not.toEqual(a.containers);
  });

  it('produces valid, unsolved, solvable boards with the right item counts for 300 levels', () => {
    for (let level = 1; level <= 300; level += 1) {
      const config = getLevelConfig(level);
      const { containers } = generateLevel(config);
      const items = containers.flatMap((c) => c.items);
      expect(items).toHaveLength(config.colorCount * CONTAINER_CAPACITY);
      expect(containers).toHaveLength(config.colorCount + config.emptyContainerCount);
      expect(containers.filter((c) => c.items.length === 0).length).toBeGreaterThanOrEqual(
        config.emptyContainerCount,
      );
      const perColor = new Map<string, number>();
      items.forEach((i) => perColor.set(i.colorId, (perColor.get(i.colorId) ?? 0) + 1));
      expect(perColor.size).toBe(config.colorCount);
      perColor.forEach((count) => expect(count).toBe(CONTAINER_CAPACITY));
      expect(isLevelComplete(containers)).toBe(false);
      expect(validateLevel(containers)).toEqual({ valid: true, problems: [] });
    }
  });
});

describe('scrambleByReverseMoves', () => {
  it('produces an unsolved board that the solver can finish', () => {
    const config = getLevelConfig(80);
    const scrambled = scrambleByReverseMoves(generateSolvedContainers(config), 'test', 200);
    expect(isLevelComplete(scrambled)).toBe(false);
    expect(listValidMoves(scrambled).length).toBeGreaterThan(0);
    expect(solve(scrambled).solved).toBe(true);
  });
});

describe('validateLevel', () => {
  it('flags a solved board', () => {
    const solved = generateSolvedContainers(getLevelConfig(1));
    expect(validateLevel(solved).problems).toContain('already solved');
  });
});
