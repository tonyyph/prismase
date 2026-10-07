import type { ContainerState } from '../types';

let counter = 0;

/** Builds a board from colour strings, bottom to top: board(['ab', 'b', '']). */
export const board = (stacks: string[], capacity = 4): ContainerState[] =>
  stacks.map((stack, index) => ({
    id: `c${index}`,
    capacity,
    items: [...stack].map((colorId) => ({ id: `${colorId}-${(counter += 1)}`, colorId })),
  }));

export const colorsOf = (containers: ContainerState[]) =>
  containers.map((c) => c.items.map((i) => i.colorId).join(''));
