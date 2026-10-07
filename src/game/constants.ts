import type { PlayerProgress, Settings } from './types';

export const CONTAINER_CAPACITY = 4;

/** Levels shown in Level Select. Levels beyond this are still generated on demand. */
export const LEVEL_SELECT_COUNT = 300;

export const FREE_UNDOS_PER_LEVEL = 3;
/** Levels up to this one get one free hint each (tutorial + easy). */
export const FREE_HINT_MAX_LEVEL = 20;
export const MAX_EXTRA_PRISMS_PER_LEVEL = 1;

export const HINT_HIGHLIGHT_MS = 1800;

export type Emblem =
  | 'star'
  | 'horseshoe'
  | 'hat'
  | 'cactus'
  | 'anchor'
  | 'boot'
  | 'jolly'
  | 'longhorn'
  | 'spade'
  | 'compass'
  | 'wheel'
  | 'cylinder';

export type PrismColor = {
  id: string;
  name: string;
  /** Enamel colour of the concho face. */
  base: string;
  /** Every colour also carries its own carved emblem, so colour is never the only cue. */
  icon: Emblem;
  /** Light enamels take a dark emblem instead of a cream one. */
  inkEmblem?: boolean;
  pirate?: boolean;
};

/** Twelve conchos, ordered so early levels (few colours) get the most distinct hues. */
export const PRISM_COLORS: readonly PrismColor[] = [
  { id: 'crimson', name: 'Crimson star', base: '#b8322a', icon: 'star' },
  { id: 'turquoise', name: 'Turquoise horseshoe', base: '#24897d', icon: 'horseshoe' },
  { id: 'mustard', name: 'Mustard hat', base: '#d39a14', icon: 'hat', inkEmblem: true },
  { id: 'sage', name: 'Sage cactus', base: '#5b8a34', icon: 'cactus' },
  { id: 'denim', name: 'Denim anchor', base: '#2f5d9e', icon: 'anchor', pirate: true },
  { id: 'rust', name: 'Rust boot', base: '#cf6420', icon: 'boot' },
  { id: 'plum', name: 'Plum skull and bones', base: '#6e3b6e', icon: 'jolly', pirate: true },
  { id: 'saddle', name: 'Saddle longhorn', base: '#7a4a2a', icon: 'longhorn' },
  { id: 'coal', name: 'Coal spade', base: '#2e2b2c', icon: 'spade' },
  {
    id: 'bone',
    name: 'Bone compass',
    base: '#e3d3ae',
    icon: 'compass',
    inkEmblem: true,
    pirate: true,
  },
  { id: 'rose', name: 'Rose wagon wheel', base: '#c4506a', icon: 'wheel' },
  { id: 'steel', name: 'Steel cylinder', base: '#66788a', icon: 'cylinder' },
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
