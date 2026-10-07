/**
 * Pure interstitial pacing rules. The ad service decides whether an ad is loaded; these rules
 * decide whether showing one would be acceptable to the player.
 */
export type AdFrequencyState = {
  lastInterstitialAt?: number;
  levelsSinceLastInterstitial: number;
  rewardedShownRecentlyAt?: number;
  restartsSinceLastInterstitial: number;
};

export const AD_RULES = {
  /** Levels 1-5 never show interstitials. */
  firstInterstitialLevel: 6,
  levelsBetweenInterstitials: 3,
  restartsBetweenInterstitials: 4,
  minIntervalMs: 90_000,
  rewardedCooldownMs: 60_000,
} as const;

export const initialAdFrequency: AdFrequencyState = {
  levelsSinceLastInterstitial: 0,
  restartsSinceLastInterstitial: 0,
};

const pacingAllows = (state: AdFrequencyState, now: number) => {
  if (
    state.lastInterstitialAt !== undefined &&
    now - state.lastInterstitialAt < AD_RULES.minIntervalMs
  ) {
    return false;
  }
  if (
    state.rewardedShownRecentlyAt !== undefined &&
    now - state.rewardedShownRecentlyAt < AD_RULES.rewardedCooldownMs
  ) {
    return false;
  }
  return true;
};

export const recordLevelCompleted = (state: AdFrequencyState): AdFrequencyState => ({
  ...state,
  levelsSinceLastInterstitial: state.levelsSinceLastInterstitial + 1,
});

export const recordRestart = (state: AdFrequencyState): AdFrequencyState => ({
  ...state,
  restartsSinceLastInterstitial: state.restartsSinceLastInterstitial + 1,
});

export const recordInterstitialShown = (
  state: AdFrequencyState,
  now: number,
): AdFrequencyState => ({
  ...state,
  lastInterstitialAt: now,
  levelsSinceLastInterstitial: 0,
  restartsSinceLastInterstitial: 0,
});

export const recordRewardedShown = (state: AdFrequencyState, now: number): AdFrequencyState => ({
  ...state,
  rewardedShownRecentlyAt: now,
});

/** Call after `recordLevelCompleted`, with the level that was just won. */
export const shouldShowLevelCompleteInterstitial = (
  state: AdFrequencyState,
  completedLevel: number,
  now: number,
) =>
  completedLevel >= AD_RULES.firstInterstitialLevel &&
  state.levelsSinceLastInterstitial >= AD_RULES.levelsBetweenInterstitials &&
  pacingAllows(state, now);

/** Call after `recordRestart`. */
export const shouldShowRestartInterstitial = (
  state: AdFrequencyState,
  level: number,
  now: number,
) =>
  level >= AD_RULES.firstInterstitialLevel &&
  state.restartsSinceLastInterstitial >= AD_RULES.restartsBetweenInterstitials &&
  pacingAllows(state, now);

export const sanitizeAdFrequency = (raw: unknown): AdFrequencyState => {
  if (!raw || typeof raw !== 'object') return { ...initialAdFrequency };
  const r = raw as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
  return {
    lastInterstitialAt: num(r.lastInterstitialAt),
    rewardedShownRecentlyAt: num(r.rewardedShownRecentlyAt),
    levelsSinceLastInterstitial: num(r.levelsSinceLastInterstitial) ?? 0,
    restartsSinceLastInterstitial: num(r.restartsSinceLastInterstitial) ?? 0,
  };
};
