/** Small geometry helpers shared by the hand-built SVG art. */
export const f1 = (n: number) => Math.round(n * 10) / 10;

/** Points of an n-pointed star as an SVG `points` string. */
export const starPoints = (cx: number, cy: number, ro: number, ri: number, n = 5, rot = -90) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    const r = i % 2 ? ri : ro;
    return `${f1(cx + r * Math.cos(a))},${f1(cy + r * Math.sin(a))}`;
  }).join(' ');

/** Deterministic PRNG so wood grain looks hand-made but never changes between renders. */
export const seeded = (seed: number) => {
  let s = seed >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};

/** Concho rim: rounded scallops with pinched valleys. */
export const scallopPath = (cx: number, cy: number, r: number, amp: number, n: number) => {
  let d = '';
  for (let i = 0; i <= 360; i += 2) {
    const a = (i * Math.PI) / 180;
    const rr = r - amp + amp * Math.abs(Math.cos((n * a) / 2));
    d += `${i ? 'L' : 'M'}${f1(cx + rr * Math.cos(a))} ${f1(cy + rr * Math.sin(a))} `;
  }
  return `${d}Z`;
};
