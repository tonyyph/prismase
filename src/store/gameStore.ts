import { create } from 'zustand';

import { DEFAULT_PROGRESS, DEFAULT_SETTINGS, HINT_HIGHLIGHT_MS } from '../game/constants';
import { type PaidAction, COSTS, paymentPlan } from '../game/economy';
import { getLevel } from '../game/levelGenerator';
import {
  addCoins,
  applySkip,
  applyWin,
  claimDaily,
  consumeInventory,
  recordLevelStart,
  spendCoins,
} from '../game/progress';
import {
  type LevelAction,
  canAddExtraPrism,
  canUndo,
  createLevelState,
  isCompleted,
  levelReducer,
} from '../game/reducer';
import { elapsedMs, moveCount } from '../game/selectors';
import type { GameStatus, LevelState, PlayerProgress, Settings } from '../game/types';
import {
  type AdFrequencyState,
  initialAdFrequency,
  recordInterstitialShown,
  recordLevelCompleted,
  recordRestart,
  recordRewardedShown,
  shouldShowLevelCompleteInterstitial,
  shouldShowRestartInterstitial,
} from '../services/ads/adFrequency';
import { adService } from '../services/ads/adService';
import type { AdPlacement } from '../services/ads/adTypes';
import {
  clearProgress,
  loadAdFrequency,
  loadProgress,
  saveAdFrequency,
  saveProgress,
} from '../services/storage/progressStorage';
import { loadSettings, saveSettings } from '../services/storage/settingsStorage';

export type WinSummary = {
  level: number;
  coinsEarned: number;
  firstClear: boolean;
  doubled: boolean;
  moves: number;
  timeMs: number;
};

export type Toast = { message: string; seq: number };

const REWARD_PLACEMENT: Record<PaidAction, AdPlacement> = {
  hint: 'reward_hint',
  undo: 'reward_undo',
  extraPrism: 'reward_extra_prism',
};

type Store = {
  status: GameStatus;
  /** Where Settings / How To Play return to. */
  returnTo: GameStatus;
  progress: PlayerProgress;
  settings: Settings;
  adFrequency: AdFrequencyState;
  level: LevelState | null;
  lastWin: WinSummary | null;
  /** The paid action whose "coins or ad" sheet is open. */
  purchase: PaidAction | null;
  toast: Toast | null;
  /** Bumped whenever coins are gained, so the coin pill can pulse. */
  coinPulse: number;
  /** True while an ad or other async transition runs, to ignore double taps. */
  busy: boolean;

  boot: () => Promise<void>;
  startLevel: (level: number) => void;
  continueGame: () => void;
  replayLevel: (level?: number) => void;
  goToNextLevel: () => Promise<void>;
  tapContainer: (containerId: string) => void;
  requestAction: (action: PaidAction) => void;
  payWithCoins: () => void;
  payWithAd: () => Promise<void>;
  closePurchase: () => void;
  clearHint: () => void;
  restartLevel: () => Promise<void>;
  skipLevel: () => Promise<void>;
  doubleCoins: () => Promise<void>;
  claimDailyReward: () => void;
  openPause: () => void;
  resumeGame: () => void;
  backToMenu: () => void;
  navigate: (
    status: Extract<GameStatus, 'menu' | 'levelSelect' | 'settings' | 'howToPlay'>,
  ) => void;
  goBack: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetProgress: () => Promise<void>;
  showToast: (message: string) => void;
};

export const useGameStore = create<Store>((set, get) => {
  const setProgress = (progress: PlayerProgress, gainedCoins = false) => {
    set((s) => ({ progress, coinPulse: gainedCoins ? s.coinPulse + 1 : s.coinPulse }));
    void saveProgress(progress);
  };

  const setAdFrequency = (adFrequency: AdFrequencyState) => {
    set({ adFrequency });
    void saveAdFrequency(adFrequency);
  };

  const dispatch = (action: LevelAction) => {
    const level = get().level;
    if (!level) return;
    const next = levelReducer(level, action);
    if (next === level) return;
    set({ level: next });
    if (!isCompleted(level) && isCompleted(next)) completeLevel(next);
  };

  const completeLevel = (level: LevelState) => {
    const { progress, adFrequency } = get();
    const win = applyWin(progress, level.level);
    setProgress(win.progress, true);
    setAdFrequency(recordLevelCompleted(adFrequency));
    set({
      status: 'levelComplete',
      lastWin: {
        level: level.level,
        coinsEarned: win.coinsEarned,
        firstClear: win.firstClear,
        doubled: false,
        moves: moveCount(level),
        timeMs: elapsedMs(level, Date.now()),
      },
    });
  };

  const performPaid = (action: PaidAction, useFreeQuota: boolean) => {
    switch (action) {
      case 'undo':
        dispatch({ type: 'undoMove', useFreeQuota });
        break;
      case 'hint':
        dispatch({ type: 'useHint', useFreeQuota });
        break;
      case 'extraPrism':
        dispatch({ type: 'addExtraPrism' });
        break;
    }
  };

  /** Shows a rewarded ad, records it for pacing, and resolves whether the reward was earned. */
  const rewarded = async (placement: AdPlacement) => {
    if (get().busy) return false;
    if (!adService.isRewardedReady(placement)) {
      get().showToast('No ad available right now. Try again soon.');
      return false;
    }
    set({ busy: true });
    try {
      const earned = await adService.showRewarded(placement);
      setAdFrequency(recordRewardedShown(get().adFrequency, Date.now()));
      return earned;
    } finally {
      set({ busy: false });
    }
  };

  const interstitial = async (placement: AdPlacement) => {
    if (!adService.canShowInterstitial()) return;
    set({ busy: true });
    try {
      const shown = await adService.showInterstitial(placement);
      if (shown) setAdFrequency(recordInterstitialShown(get().adFrequency, Date.now()));
    } finally {
      set({ busy: false });
    }
  };

  return {
    status: 'booting',
    returnTo: 'menu',
    progress: DEFAULT_PROGRESS,
    settings: DEFAULT_SETTINGS,
    adFrequency: initialAdFrequency,
    level: null,
    lastWin: null,
    purchase: null,
    toast: null,
    coinPulse: 0,
    busy: false,

    boot: async () => {
      const [progress, settings, adFrequency] = await Promise.all([
        loadProgress(),
        loadSettings(),
        loadAdFrequency(),
        adService.initialize().catch((error) => console.warn('[ads] init failed', error)),
      ]);
      set({ progress, settings, adFrequency, status: 'menu' });
    },

    startLevel: (levelNumber) => {
      const { progress } = get();
      const level = Math.max(1, Math.min(levelNumber, progress.unlockedLevel));
      const generated = getLevel(level);
      setProgress(recordLevelStart(progress, level));
      set({
        level: createLevelState(level, generated.containers, Date.now()),
        status: 'playing',
        lastWin: null,
        purchase: null,
      });
    },

    continueGame: () => get().startLevel(get().progress.currentLevel),

    replayLevel: (level) => get().startLevel(level ?? get().level?.level ?? 1),

    goToNextLevel: async () => {
      const { lastWin, adFrequency, busy } = get();
      if (busy) return;
      const next = (lastWin?.level ?? get().progress.currentLevel - 1) + 1;
      if (lastWin && shouldShowLevelCompleteInterstitial(adFrequency, lastWin.level, Date.now())) {
        await interstitial('level_complete_interstitial');
      }
      get().startLevel(next);
    },

    tapContainer: (containerId) => {
      if (get().status !== 'playing' || get().busy) return;
      dispatch({ type: 'tapContainer', containerId, now: Date.now() });
    },

    requestAction: (action) => {
      const { level, progress, status } = get();
      if (!level || status !== 'playing' || isCompleted(level)) return;
      if (action === 'undo' && !canUndo(level)) return get().showToast('Nothing to undo yet.');
      if (action === 'extraPrism' && !canAddExtraPrism(level)) {
        return get().showToast('One extra prism per level.');
      }
      const plan = paymentPlan(action, level, progress);
      if (plan.kind === 'free') return performPaid(action, true);
      if (plan.kind === 'inventory') {
        const next = consumeInventory(progress, action);
        if (next) setProgress(next);
        return performPaid(action, false);
      }
      set({ purchase: action });
    },

    payWithCoins: () => {
      const { purchase, progress } = get();
      if (!purchase) return;
      const next = spendCoins(progress, COSTS[purchase]);
      if (!next) return get().showToast('Not enough coins.');
      setProgress(next);
      set({ purchase: null });
      performPaid(purchase, false);
    },

    payWithAd: async () => {
      const { purchase } = get();
      if (!purchase) return;
      const earned = await rewarded(REWARD_PLACEMENT[purchase]);
      set({ purchase: null });
      if (earned) performPaid(purchase, false);
    },

    closePurchase: () => set({ purchase: null }),

    clearHint: () => dispatch({ type: 'clearHint' }),

    restartLevel: async () => {
      const { level, adFrequency, busy } = get();
      if (!level || busy) return;
      const frequency = recordRestart(adFrequency);
      setAdFrequency(frequency);
      if (shouldShowRestartInterstitial(frequency, level.level, Date.now())) {
        await interstitial('restart_interstitial');
      }
      const current = get().level;
      if (!current) return;
      set({
        level: levelReducer(current, { type: 'restartLevel', now: Date.now() }),
        status: 'playing',
      });
    },

    skipLevel: async () => {
      const { level } = get();
      if (!level) return;
      const earned = await rewarded('reward_skip_level');
      if (!earned) return;
      setProgress(applySkip(get().progress, level.level));
      get().startLevel(level.level + 1);
    },

    doubleCoins: async () => {
      const { lastWin } = get();
      if (!lastWin || lastWin.doubled) return;
      const earned = await rewarded('reward_double_coins');
      if (!earned) return;
      setProgress(addCoins(get().progress, lastWin.coinsEarned), true);
      set({ lastWin: { ...lastWin, doubled: true } });
    },

    claimDailyReward: () => {
      const next = claimDaily(get().progress, Date.now());
      if (next) setProgress(next, true);
    },

    openPause: () => {
      if (get().status === 'playing') set({ status: 'paused', purchase: null });
    },

    resumeGame: () => {
      if (get().status === 'paused') set({ status: 'playing' });
    },

    backToMenu: () => set({ status: 'menu', level: null, purchase: null }),

    navigate: (status) => {
      const current = get().status;
      set({
        status,
        returnTo: current === 'settings' || current === 'howToPlay' ? get().returnTo : current,
      });
    },

    goBack: () => {
      const { status, returnTo, level } = get();
      if (status === 'settings' || status === 'howToPlay') {
        const target =
          (returnTo === 'paused' || returnTo === 'playing') && !level ? 'menu' : returnTo;
        set({ status: target });
      } else if (status === 'levelSelect') {
        set({ status: 'menu' });
      } else if (status === 'playing') {
        get().openPause();
      } else if (status === 'paused') {
        get().resumeGame();
      }
    },

    updateSettings: (patch) => {
      const settings = { ...get().settings, ...patch };
      set({ settings });
      void saveSettings(settings);
    },

    resetProgress: async () => {
      await clearProgress();
      setProgress({ ...DEFAULT_PROGRESS });
      setAdFrequency({ ...initialAdFrequency });
      set({ level: null, lastWin: null });
    },

    showToast: (message) => set((s) => ({ toast: { message, seq: (s.toast?.seq ?? 0) + 1 } })),
  };
});

export const getSettings = () => useGameStore.getState().settings;

export { HINT_HIGHLIGHT_MS };
