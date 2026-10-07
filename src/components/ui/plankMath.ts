import { f1, seeded } from '../art/geometry';
import { mix } from '../../utils/color';

export { f1 };

export type PlankRow = {
  y: number;
  h: number;
  tone: string;
  joint: number;
  knot?: number;
  grain: { d: string; o: number; w: number }[];
};

/** Lays out boards for a w×h area: tone, grain lines, a knot now and then, and a butt joint. */
export const mixSeed = (w: number, h: number, seed: number): PlankRow[] => {
  const r = seeded(seed);
  const rows: PlankRow[] = [];
  const ph = 46;
  for (let y = -10, k = 0; y < h; y += ph, k += 1) {
    const grain = Array.from({ length: 3 }, () => {
      const yy = y + 8 + r() * (ph - 16);
      return {
        d: `M0 ${f1(yy)} C${f1(w * 0.25)} ${f1(yy - 4 + r() * 8)} ${f1(w * 0.6)} ${f1(yy - 4 + r() * 8)} ${w} ${f1(yy)}`,
        o: f1(0.12 + r() * 0.1),
        w: f1(0.8 + r()),
      };
    });
    const knotX = r() * w;
    rows.push({
      y,
      h: ph,
      tone: mix('#4a2a17', '#61391f', r()),
      grain,
      knot: r() > 0.55 ? f1(knotX) : undefined,
      joint: f1((k % 2 ? 0.35 : 0.72) * w + r() * 30),
    });
  }
  return rows;
};
