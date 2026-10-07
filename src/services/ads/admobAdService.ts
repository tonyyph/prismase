import type { AdPlacement, AdService } from './adTypes';

/**
 * AdMob implementation, not wired up in v1.
 *
 * TODO(ads): to go live
 *   1. `npx expo install react-native-google-mobile-ads` and add its config plugin to app.json
 *      with `androidAppId` / `iosAppId` (AdMob console → App settings).
 *   2. Add ad unit ids per placement below (use TestIds while developing).
 *   3. Implement the methods with `InterstitialAd.createForAdRequest` and
 *      `RewardedAd.createForAdRequest`: preload on initialize, reload after each show, and
 *      resolve `showRewarded` with true only on `RewardedAdEventType.EARNED_REWARD`.
 *   4. Show the UMP consent form (`AdsConsent.requestInfoUpdate` / `loadAndShowConsentFormIfRequired`)
 *      before the first request, and on iOS request App Tracking Transparency if you will use
 *      the IDFA. Then update PRIVACY.md and the store privacy labels.
 *   5. Switch `createAdService` in adService.ts to return this class.
 * Pacing stays in adFrequency.ts; this class should only know how to load and show.
 */
export const ADMOB_UNIT_IDS: Record<AdPlacement, { ios: string; android: string }> = {
  level_complete_interstitial: { ios: 'TODO', android: 'TODO' },
  restart_interstitial: { ios: 'TODO', android: 'TODO' },
  reward_hint: { ios: 'TODO', android: 'TODO' },
  reward_undo: { ios: 'TODO', android: 'TODO' },
  reward_extra_prism: { ios: 'TODO', android: 'TODO' },
  reward_skip_level: { ios: 'TODO', android: 'TODO' },
  reward_double_coins: { ios: 'TODO', android: 'TODO' },
};

export class AdMobAdService implements AdService {
  async initialize() {
    // TODO(ads): await mobileAds().initialize(); preload one interstitial and one rewarded ad.
  }

  async showInterstitial(_placement: AdPlacement) {
    // TODO(ads): show the preloaded interstitial, resolve on CLOSED, then preload the next.
    return false;
  }

  async showRewarded(_placement: AdPlacement) {
    // TODO(ads): show the preloaded rewarded ad; resolve true only after EARNED_REWARD.
    return false;
  }

  isRewardedReady(_placement: AdPlacement) {
    // TODO(ads): return whether the rewarded ad for this placement has loaded.
    return false;
  }

  canShowInterstitial() {
    // TODO(ads): return whether an interstitial has loaded.
    return false;
  }
}
