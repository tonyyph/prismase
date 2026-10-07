import { FREE_HINT_MAX_LEVEL, FREE_UNDOS_PER_LEVEL, MAX_EXTRA_PRISMS_PER_LEVEL } from './constants';
import { findBestMove } from './hint';
import { canMove, isContainerComplete, isLevelComplete, moveItem, revertMove } from './moveRules';
import type { BoardEvent, ContainerState, LevelState } from './types';

export type LevelAction =
  | { type: 'tapContainer'; containerId: string; now: number }
  | { type: 'selectContainer'; containerId: string }
  | { type: 'moveItem'; sourceId: string; targetId: string; now: number }
  | { type: 'undoMove'; useFreeQuota: boolean }
  | { type: 'useHint'; useFreeQuota: boolean }
  | { type: 'clearHint' }
  | { type: 'addExtraPrism' }
  | { type: 'restartLevel'; now: number };

type EventInput = BoardEvent extends infer E
  ? E extends BoardEvent
    ? Omit<E, 'seq'>
    : never
  : never;

const withEvent = (state: LevelState, event: EventInput): LevelState => ({
  ...state,
  lastEvent: { ...event, seq: (state.lastEvent?.seq ?? 0) + 1 } as BoardEvent,
});

export const freeHintsForLevel = (level: number) => (level <= FREE_HINT_MAX_LEVEL ? 1 : 0);

export const createLevelState = (
  level: number,
  containers: readonly ContainerState[],
  now: number,
): LevelState => ({
  level,
  containers: containers.map((c) => ({ ...c, items: [...c.items] })),
  initialContainers: containers.map((c) => ({ ...c, items: [...c.items] })),
  moveHistory: [],
  freeUndosLeft: FREE_UNDOS_PER_LEVEL,
  freeHintsLeft: freeHintsForLevel(level),
  extraPrismUsed: false,
  startedAt: now,
  restarts: 0,
});

export const isCompleted = (state: LevelState) => state.completedAt !== undefined;

const applyMove = (state: LevelState, sourceId: string, targetId: string, now: number) => {
  if (!canMove(state.containers, sourceId, targetId)) {
    return withEvent(
      { ...state, selectedContainerId: undefined },
      {
        kind: 'invalid',
        containerId: targetId,
      },
    );
  }
  const source = state.containers.find((c) => c.id === sourceId)!;
  const item = source.items[source.items.length - 1];
  const containers = moveItem(state.containers, sourceId, targetId);
  const target = containers.find((c) => c.id === targetId)!;
  const levelComplete = isLevelComplete(containers);
  return withEvent(
    {
      ...state,
      containers,
      selectedContainerId: undefined,
      hint: undefined,
      moveHistory: [...state.moveHistory, { sourceId, targetId, item, timestamp: now }],
      completedAt: levelComplete ? now : undefined,
    },
    {
      kind: 'move',
      move: { sourceId, targetId },
      item,
      completedContainer: isContainerComplete(target),
      levelComplete,
    },
  );
};

/**
 * Pure state machine for one level. Paying for undo/hint/extra prism (coins, ads) happens
 * outside; by the time an action reaches here it is already allowed.
 */
export const levelReducer = (state: LevelState, action: LevelAction): LevelState => {
  if (isCompleted(state) && action.type !== 'restartLevel') return state;

  switch (action.type) {
    case 'selectContainer': {
      const container = state.containers.find((c) => c.id === action.containerId);
      if (!container?.items.length) {
        return withEvent(state, { kind: 'invalid', containerId: action.containerId });
      }
      return withEvent(
        { ...state, selectedContainerId: action.containerId },
        { kind: 'select', containerId: action.containerId },
      );
    }

    case 'tapContainer': {
      const { containerId } = action;
      const selected = state.selectedContainerId;
      if (!selected) return levelReducer(state, { type: 'selectContainer', containerId });
      if (selected === containerId) {
        return withEvent(
          { ...state, selectedContainerId: undefined },
          { kind: 'deselect', containerId },
        );
      }
      if (canMove(state.containers, selected, containerId)) {
        return applyMove(state, selected, containerId, action.now);
      }
      // A miss shakes the target and drops the pick, so the next tap starts fresh.
      return withEvent(
        { ...state, selectedContainerId: undefined },
        { kind: 'invalid', containerId },
      );
    }

    case 'moveItem':
      return applyMove(state, action.sourceId, action.targetId, action.now);

    case 'undoMove': {
      const last = state.moveHistory[state.moveHistory.length - 1];
      if (!last) return state;
      return withEvent(
        {
          ...state,
          containers: revertMove(state.containers, last),
          moveHistory: state.moveHistory.slice(0, -1),
          selectedContainerId: undefined,
          hint: undefined,
          freeUndosLeft: action.useFreeQuota
            ? Math.max(0, state.freeUndosLeft - 1)
            : state.freeUndosLeft,
        },
        { kind: 'undo', move: { sourceId: last.sourceId, targetId: last.targetId } },
      );
    }

    case 'useHint': {
      const move = findBestMove(state.containers);
      if (!move) return state;
      return {
        ...state,
        selectedContainerId: undefined,
        hint: { ...move, seq: (state.hint?.seq ?? 0) + 1 },
        freeHintsLeft: action.useFreeQuota
          ? Math.max(0, state.freeHintsLeft - 1)
          : state.freeHintsLeft,
      };
    }

    case 'clearHint':
      return state.hint ? { ...state, hint: undefined } : state;

    case 'addExtraPrism': {
      const extras = state.containers.filter((c) => c.isExtra).length;
      if (extras >= MAX_EXTRA_PRISMS_PER_LEVEL) return state;
      const id = `x${extras + 1}`;
      const capacity = state.containers[0]?.capacity ?? 4;
      return withEvent(
        {
          ...state,
          containers: [...state.containers, { id, items: [], capacity, isExtra: true }],
          extraPrismUsed: true,
        },
        { kind: 'extraPrism', containerId: id },
      );
    }

    case 'restartLevel':
      return withEvent(
        {
          ...createLevelState(state.level, state.initialContainers, action.now),
          restarts: state.restarts + 1,
          lastEvent: state.lastEvent,
        },
        { kind: 'restart' },
      );
  }
};

export const canUndo = (state: LevelState) => !isCompleted(state) && state.moveHistory.length > 0;
export const canAddExtraPrism = (state: LevelState) => !isCompleted(state) && !state.extraPrismUsed;
