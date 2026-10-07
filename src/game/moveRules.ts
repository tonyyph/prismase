import type { ContainerState, Move, PrismItem } from './types';

export const topItem = (container: ContainerState): PrismItem | undefined =>
  container.items[container.items.length - 1];

export const isFull = (container: ContainerState) => container.items.length >= container.capacity;

const findContainer = (containers: readonly ContainerState[], id: string) =>
  containers.find((c) => c.id === id);

/** Every rule in one place: non-empty source, distinct target with room and a matching top. */
export const canMove = (
  containers: readonly ContainerState[],
  sourceId: string,
  targetId: string,
): boolean => {
  if (sourceId === targetId) return false;
  const source = findContainer(containers, sourceId);
  const target = findContainer(containers, targetId);
  if (!source || !target) return false;
  const item = topItem(source);
  if (!item) return false;
  if (isFull(target)) return false;
  const targetTop = topItem(target);
  return !targetTop || targetTop.colorId === item.colorId;
};

/** Returns a new board with the move applied, or the same board if the move is illegal. */
export const moveItem = (
  containers: readonly ContainerState[],
  sourceId: string,
  targetId: string,
): ContainerState[] => {
  if (!canMove(containers, sourceId, targetId)) return [...containers];
  const source = findContainer(containers, sourceId)!;
  const item = topItem(source)!;
  return containers.map((c) => {
    if (c.id === sourceId) return { ...c, items: c.items.slice(0, -1) };
    if (c.id === targetId) return { ...c, items: [...c.items, item] };
    return c;
  });
};

/** Puts the target's top item back on the source, bypassing the colour rule (for undo). */
export const revertMove = (
  containers: readonly ContainerState[],
  { sourceId, targetId }: Move,
): ContainerState[] => {
  const target = findContainer(containers, targetId);
  const item = target && topItem(target);
  if (!item) return [...containers];
  return containers.map((c) => {
    if (c.id === targetId) return { ...c, items: c.items.slice(0, -1) };
    if (c.id === sourceId) return { ...c, items: [...c.items, item] };
    return c;
  });
};

export const isContainerComplete = (container: ContainerState): boolean =>
  container.items.length === container.capacity &&
  container.items.every((item) => item.colorId === container.items[0].colorId);

export const isLevelComplete = (containers: readonly ContainerState[]): boolean =>
  containers.every((c) => c.items.length === 0 || isContainerComplete(c));

export const listValidMoves = (containers: readonly ContainerState[]): Move[] => {
  const moves: Move[] = [];
  for (const source of containers) {
    for (const target of containers) {
      if (canMove(containers, source.id, target.id)) {
        moves.push({ sourceId: source.id, targetId: target.id });
      }
    }
  }
  return moves;
};
