/**
 * Board geometry, in units of one item slot `s`. Pure so it can be unit tested for every
 * container count on small and large phones.
 */
export const TUBE = {
  padX: 0.16,
  gap: 0.05,
  // Clear the painted crate's top rail and iron band, and its bottom band and rail.
  padTop: 0.46,
  padBottom: 0.54,
  /** Room above each tube for the lifted (selected) item. */
  lift: 1.05,
  hGap: 0.3,
  vGap: 0.32,
} as const;

export const MAX_SLOT = 60;

export type Rect = { x: number; y: number; width: number; height: number };

export type BoardLayout = {
  slot: number;
  rows: number;
  tubeWidth: number;
  tubeHeight: number;
  liftSpace: number;
  /** Each container's full rect (lift space + tube), in board coordinates. */
  rects: Rect[];
  /** Horizontal gap between tubes, used to widen touch targets. */
  gapX: number;
};

const tubeHeightFor = (slot: number, capacity: number) =>
  slot * (capacity + (capacity - 1) * TUBE.gap + TUBE.padTop + TUBE.padBottom);

export const computeBoardLayout = (
  count: number,
  capacity: number,
  width: number,
  height: number,
  maxSlot = MAX_SLOT,
): BoardLayout => {
  const unitW = 1 + TUBE.padX * 2;
  const unitH = TUBE.lift + capacity + (capacity - 1) * TUBE.gap + TUBE.padTop + TUBE.padBottom;
  let best = { slot: 0, rows: 1 };
  for (let rows = 1; rows <= 4; rows += 1) {
    const perRow = Math.ceil(count / rows);
    const slotW = width / (perRow * unitW + (perRow - 1) * unitW * TUBE.hGap);
    const slotH = height / (rows * unitH + (rows - 1) * TUBE.vGap);
    const slot = Math.min(slotW, slotH, maxSlot);
    // Prefer fewer rows unless more rows make items clearly bigger.
    if (slot > best.slot * 1.04) best = { slot, rows };
  }

  const slot = Math.floor(best.slot);
  const { rows } = best;
  const tubeWidth = slot * unitW;
  const tubeHeight = tubeHeightFor(slot, capacity);
  const liftSpace = slot * TUBE.lift;
  const rowHeight = liftSpace + tubeHeight;
  const gapX = tubeWidth * TUBE.hGap;
  const gapY = slot * TUBE.vGap;
  const totalHeight = rows * rowHeight + (rows - 1) * gapY;
  const offsetY = Math.max(0, (height - totalHeight) / 2);

  const rects: Rect[] = [];
  const perRow = Math.ceil(count / rows);
  for (let row = 0; row < rows; row += 1) {
    const inRow = Math.min(perRow, count - row * perRow);
    const rowWidth = inRow * tubeWidth + (inRow - 1) * gapX;
    const startX = (width - rowWidth) / 2;
    for (let col = 0; col < inRow; col += 1) {
      rects.push({
        x: startX + col * (tubeWidth + gapX),
        y: offsetY + row * (rowHeight + gapY),
        width: tubeWidth,
        height: rowHeight,
      });
    }
  }
  return { slot, rows, tubeWidth, tubeHeight, liftSpace, rects, gapX };
};

/** Centre of item slot `index` (0 = bottom), relative to its container rect. */
export const slotCenter = (layout: BoardLayout, capacity: number, index: number) => {
  const { slot, liftSpace, tubeWidth } = layout;
  const tubeHeight = tubeHeightFor(slot, capacity);
  return {
    x: tubeWidth / 2,
    y:
      liftSpace +
      tubeHeight -
      slot * TUBE.padBottom -
      (index + 0.5) * slot -
      index * TUBE.gap * slot,
  };
};

/** Centre of the lifted (selected) item, relative to its container rect. */
export const liftCenter = (layout: BoardLayout) => ({
  x: layout.tubeWidth / 2,
  y: layout.liftSpace - layout.slot * 0.58,
});
