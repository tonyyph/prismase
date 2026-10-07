import {
  AD_RULES,
  initialAdFrequency,
  recordInterstitialShown,
  recordLevelCompleted,
  recordRestart,
  recordRewardedShown,
  sanitizeAdFrequency,
  shouldShowLevelCompleteInterstitial,
  shouldShowRestartInterstitial,
} from '../adFrequency';
import { MockAdService } from '../mockAdService';

const T0 = 1_000_000;
const winLevels = (count: number, state = initialAdFrequency) => {
  let s = state;
  for (let i = 0; i < count; i += 1) s = recordLevelCompleted(s);
  return s;
};

describe('level complete interstitial', () => {
  it('never shows before level 6', () => {
    const s = winLevels(5);
    for (let level = 1; level <= 5; level += 1) {
      expect(shouldShowLevelCompleteInterstitial(s, level, T0)).toBe(false);
    }
    expect(shouldShowLevelCompleteInterstitial(s, 6, T0)).toBe(true);
  });

  it('waits for 3 wins between ads', () => {
    const shown = recordInterstitialShown(winLevels(3), T0);
    const later = T0 + 10 * 60_000;
    expect(shouldShowLevelCompleteInterstitial(winLevels(2, shown), 20, later)).toBe(false);
    expect(shouldShowLevelCompleteInterstitial(winLevels(3, shown), 20, later)).toBe(true);
  });

  it('enforces the 90 second gap', () => {
    const s = winLevels(3, recordInterstitialShown(initialAdFrequency, T0));
    expect(shouldShowLevelCompleteInterstitial(s, 20, T0 + AD_RULES.minIntervalMs - 1)).toBe(false);
    expect(shouldShowLevelCompleteInterstitial(s, 20, T0 + AD_RULES.minIntervalMs)).toBe(true);
  });

  it('skips if a rewarded ad played in the last 60 seconds', () => {
    const s = recordRewardedShown(winLevels(3), T0);
    expect(shouldShowLevelCompleteInterstitial(s, 20, T0 + 30_000)).toBe(false);
    expect(shouldShowLevelCompleteInterstitial(s, 20, T0 + 60_000)).toBe(true);
  });
});

describe('restart interstitial', () => {
  it('needs several restarts and respects the same caps', () => {
    let s = initialAdFrequency;
    for (let i = 0; i < AD_RULES.restartsBetweenInterstitials - 1; i += 1) s = recordRestart(s);
    expect(shouldShowRestartInterstitial(s, 20, T0)).toBe(false);
    s = recordRestart(s);
    expect(shouldShowRestartInterstitial(s, 20, T0)).toBe(true);
    expect(shouldShowRestartInterstitial(s, 3, T0)).toBe(false);
    const after = recordInterstitialShown(s, T0);
    expect(after.restartsSinceLastInterstitial).toBe(0);
    expect(after.levelsSinceLastInterstitial).toBe(0);
  });
});

it('sanitizes stored state', () => {
  expect(sanitizeAdFrequency('x')).toEqual(initialAdFrequency);
  expect(sanitizeAdFrequency({ levelsSinceLastInterstitial: 2, lastInterstitialAt: 'no' })).toEqual(
    {
      levelsSinceLastInterstitial: 2,
      restartsSinceLastInterstitial: 0,
      lastInterstitialAt: undefined,
      rewardedShownRecentlyAt: undefined,
    },
  );
});

describe('MockAdService', () => {
  it('is not ready before initialize and rewards after', async () => {
    const ads = new MockAdService();
    expect(ads.isRewardedReady('reward_hint')).toBe(false);
    expect(await ads.showRewarded('reward_hint')).toBe(false);
    await ads.initialize();
    expect(ads.isRewardedReady('reward_hint')).toBe(true);
    expect(await ads.showRewarded('reward_hint')).toBe(true);
  });

  it('routes through a presenter and reports whether the reward was earned', async () => {
    const ads = new MockAdService();
    await ads.initialize();
    ads.setPresenter((request) => request?.finish(false));
    expect(await ads.showRewarded('reward_undo')).toBe(false);
    ads.setPresenter((request) => request?.finish(true));
    expect(await ads.showInterstitial('level_complete_interstitial')).toBe(true);
  });

  it('can simulate no-fill', async () => {
    const ads = new MockAdService({ fillRate: 0.5, random: () => 0.9 });
    await ads.initialize();
    expect(ads.isRewardedReady('reward_hint')).toBe(false);
  });
});
