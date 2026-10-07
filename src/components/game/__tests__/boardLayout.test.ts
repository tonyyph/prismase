import { CONTAINER_CAPACITY } from '../../../game/constants';
import { computeBoardLayout, slotCenter } from '../boardLayout';

const PHONES = {
  'iPhone SE': { width: 343, height: 470 },
  'small Android': { width: 328, height: 450 },
  'Pro Max': { width: 398, height: 640 },
};

describe.each(Object.entries(PHONES))('%s', (_name, { width, height }) => {
  it.each([5, 6, 7, 9, 11, 14, 16])('fits %i containers inside the board', (count) => {
    const layout = computeBoardLayout(count, CONTAINER_CAPACITY, width, height);
    expect(layout.rects).toHaveLength(count);
    for (const r of layout.rects) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(width + 0.5);
      expect(r.y + r.height).toBeLessThanOrEqual(height + 0.5);
    }
    // Items stay big enough to read and tubes wide enough to tap (with the gap as hit slop).
    expect(layout.slot).toBeGreaterThanOrEqual(24);
    expect(layout.tubeWidth + layout.gapX).toBeGreaterThanOrEqual(40);
  });
});

it('never overlaps containers', () => {
  const { rects } = computeBoardLayout(16, 4, 343, 470);
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i];
      const b = rects[j];
      const overlap =
        a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
      expect(overlap).toBe(false);
    }
  }
});

it('stacks slots upward from the bottom of the tube', () => {
  const layout = computeBoardLayout(5, 4, 343, 470);
  const ys = [0, 1, 2, 3].map((i) => slotCenter(layout, 4, i).y);
  expect(ys).toEqual([...ys].sort((a, b) => b - a));
  expect(ys[3]).toBeGreaterThan(layout.liftSpace);
});
