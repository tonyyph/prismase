import { type Random, randomInt } from './seedRandom';

/** Fisher-Yates shuffle returning a new array. */
export const shuffle = <T>(items: readonly T[], random: Random): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = randomInt(random, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};
