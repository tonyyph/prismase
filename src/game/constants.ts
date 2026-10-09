import type { PlayerProgress, Settings } from './types';

export const CONTAINER_CAPACITY = 4;

/** Levels shown in Level Select. Levels beyond this are still generated on demand. */
export const LEVEL_SELECT_COUNT = 300;

export const FREE_UNDOS_PER_LEVEL = 3;
/** Levels up to this one get one free hint each (tutorial + easy). */
export const FREE_HINT_MAX_LEVEL = 20;
export const MAX_EXTRA_PRISMS_PER_LEVEL = 1;

export const HINT_HIGHLIGHT_MS = 1800;

export type PrismColor = {
  /** Also the name of the piece art: assets/pieces/<id>.png. */
  id: string;
  name: string;
  /** The piece's enamel colour, used for the completed-crate glow and medallion. */
  base: string;
};

/**
 * Twelve painted pieces (Tony's art), chosen from the sheets so every hue is clearly
 * different, and ordered so early levels (few colours) get the most distinct ones.
 * The other pieces on the sheets share a hue with one of these and are not used.
 */
export const PRISM_COLORS: readonly PrismColor[] = [
  { id: 'lasso', name: 'Red lasso', base: '#b81c1c' },
  { id: 'saloon-doors', name: 'Blue saloon doors', base: '#1f48c0' },
  { id: 'blocks', name: 'Yellow gold blocks', base: '#e6b90e' },
  { id: 'laurel', name: 'Lime laurel', base: '#5aae1e' },
  { id: 'spur', name: 'Orange spur', base: '#e0700e' },
  { id: 'chest', name: 'Plum treasure chest', base: '#8a1a6a' },
  { id: 'sunset', name: 'Teal desert sunset', base: '#1a7f8a' },
  { id: 'crates', name: 'Pink crates', base: '#e0508e' },
  { id: 'revolvers', name: 'Green revolvers', base: '#15723c' },
  { id: 'pyramid', name: 'Violet pyramid', base: '#7a22c0' },
  { id: 'rings', name: 'Cyan rings', base: '#20b0d0' },
  { id: 'target', name: 'Slate target', base: '#4a6488' },
];

export const MAX_COLORS = PRISM_COLORS.length;

const COLOR_BY_ID = new Map(PRISM_COLORS.map((c) => [c.id, c]));
export const getPrismColor = (id: string): PrismColor => COLOR_BY_ID.get(id) ?? PRISM_COLORS[0];

export const DEFAULT_PROGRESS: PlayerProgress = {
  currentLevel: 1,
  unlockedLevel: 1,
  completedLevels: [],
  coins: 50,
  hints: 0,
  undos: 0,
  extraPrisms: 0,
  gamesPlayed: 0,
  totalWins: 0,
  tutorialCompleted: false,
};

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  hapticsEnabled: true,
  reducedMotion: false,
  hintAnimation: true,
};
