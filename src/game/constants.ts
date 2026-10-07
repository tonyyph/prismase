import type { PlayerProgress, PrismVariant, Settings } from './types';

export const CONTAINER_CAPACITY = 4;

/** Levels shown in Level Select. Levels beyond this are still generated on demand. */
export const LEVEL_SELECT_COUNT = 300;

export const FREE_UNDOS_PER_LEVEL = 3;
/** Levels up to this one get one free hint each (tutorial + easy). */
export const FREE_HINT_MAX_LEVEL = 20;
export const MAX_EXTRA_PRISMS_PER_LEVEL = 1;

export const HINT_HIGHLIGHT_MS = 1800;

export type PrismColor = {
  id: string;
  name: string;
  base: string;
  light: string;
  dark: string;
  /** Shape varies so that neighbouring hues stay distinguishable for colour-blind players. */
  variant: PrismVariant;
};

/**
 * Ordered so that early levels (few colours) get the most distinct hues. The palette is the
 * product brief's twelve prism colours.
 */
export const PRISM_COLORS: readonly PrismColor[] = [
  { id: 'cyan', name: 'Cyan', base: '#22D3EE', light: '#A5F3FC', dark: '#0E7490', variant: 'gem' },
  { id: 'pink', name: 'Pink', base: '#F472B6', light: '#FBCFE8', dark: '#BE185D', variant: 'orb' },
  {
    id: 'amber',
    name: 'Amber',
    base: '#FBBF24',
    light: '#FEF3C7',
    dark: '#B45309',
    variant: 'gem',
  },
  {
    id: 'violet',
    name: 'Violet',
    base: '#A78BFA',
    light: '#DDD6FE',
    dark: '#6D28D9',
    variant: 'shard',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    base: '#34D399',
    light: '#A7F3D0',
    dark: '#047857',
    variant: 'shard',
  },
  { id: 'blue', name: 'Blue', base: '#3B82F6', light: '#BFDBFE', dark: '#1D4ED8', variant: 'orb' },
  {
    id: 'orange',
    name: 'Orange',
    base: '#FB923C',
    light: '#FED7AA',
    dark: '#C2410C',
    variant: 'orb',
  },
  { id: 'red', name: 'Red', base: '#EF4444', light: '#FECACA', dark: '#991B1B', variant: 'shard' },
  { id: 'lime', name: 'Lime', base: '#A3E635', light: '#ECFCCB', dark: '#4D7C0F', variant: 'orb' },
  { id: 'mint', name: 'Mint', base: '#5EEAD4', light: '#CCFBF1', dark: '#0F766E', variant: 'orb' },
  {
    id: 'lavender',
    name: 'Lavender',
    base: '#C4B5FD',
    light: '#EDE9FE',
    dark: '#7C3AED',
    variant: 'gem',
  },
  { id: 'rose', name: 'Rose', base: '#FDA4AF', light: '#FFE4E6', dark: '#BE123C', variant: 'gem' },
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
