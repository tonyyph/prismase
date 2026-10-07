export type LevelDifficulty = 'easy' | 'normal' | 'hard' | 'expert';

export type LevelConfig = {
  level: number;
  colorCount: number;
  containerCapacity: number;
  emptyContainerCount: number;
  difficulty: LevelDifficulty;
  seed: string;
};

export type PrismVariant = 'orb' | 'shard' | 'gem';

export type PrismItem = {
  id: string;
  colorId: string;
  variant?: PrismVariant;
};

export type ContainerState = {
  id: string;
  items: PrismItem[];
  capacity: number;
  isExtra?: boolean;
};

export type Move = { sourceId: string; targetId: string };

export type MoveRecord = Move & {
  item: PrismItem;
  timestamp: number;
};

/**
 * The most recent thing the board did, for the UI to animate and play feedback for.
 * `seq` increases on every event so identical consecutive events are still distinguishable.
 */
export type BoardEvent =
  | { seq: number; kind: 'select'; containerId: string }
  | { seq: number; kind: 'deselect'; containerId: string }
  | { seq: number; kind: 'invalid'; containerId: string }
  | {
      seq: number;
      kind: 'move';
      move: Move;
      item: PrismItem;
      completedContainer: boolean;
      levelComplete: boolean;
    }
  | { seq: number; kind: 'undo'; move: Move }
  | { seq: number; kind: 'restart' }
  | { seq: number; kind: 'extraPrism'; containerId: string };

export type HintHighlight = Move & { seq: number };

export type LevelState = {
  level: number;
  containers: ContainerState[];
  initialContainers: ContainerState[];
  selectedContainerId?: string;
  moveHistory: MoveRecord[];
  freeUndosLeft: number;
  freeHintsLeft: number;
  extraPrismUsed: boolean;
  startedAt: number;
  completedAt?: number;
  hint?: HintHighlight;
  lastEvent?: BoardEvent;
  /** Number of restarts of this level in the current session, used for the restart interstitial. */
  restarts: number;
};

export type GameStatus =
  | 'booting'
  | 'menu'
  | 'levelSelect'
  | 'playing'
  | 'paused'
  | 'levelComplete'
  | 'settings'
  | 'howToPlay';

export type PlayerProgress = {
  currentLevel: number;
  unlockedLevel: number;
  completedLevels: number[];
  coins: number;
  hints: number;
  undos: number;
  extraPrisms: number;
  gamesPlayed: number;
  totalWins: number;
  tutorialCompleted: boolean;
  /** Local day (YYYY-MM-DD) the daily reward was last claimed. */
  lastDailyRewardDay?: string;
};

export type Settings = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  hintAnimation: boolean;
};
