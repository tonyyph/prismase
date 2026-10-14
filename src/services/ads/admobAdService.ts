import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import { Platform } from 'react-native';
import mobileAds, {
  AdEventType,
  AdsConsent,
  InterstitialAd,
  MaxAdContentRating,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

import type { AdPlacement, AdService } from './adTypes';

/**
 * Real ad unit ids from the AdMob console, per placement. A placement without one shows no ad
 * in release builds (its rewarded button stays disabled). Development builds always use
 * Google's test units, so tapping around never risks invalid traffic on the real account.
 */
const UNIT_IDS: Partial<Record<AdPlacement, { ios?: string; android?: string }>> = {
  level_complete_interstitial: { ios: 'ca-app-pub-8416109953639059/8989926477' },
  restart_interstitial: { ios: 'ca-app-pub-8416109953639059/3327053178' },
  reward_hint: { ios: 'ca-app-pub-8416109953639059/8320534568' },
  reward_undo: { ios: 'ca-app-pub-8416109953639059/1935834477' },
  reward_extra_prism: { ios: 'ca-app-pub-8416109953639059/5694371229' },
  reward_skip_level: { ios: 'ca-app-pub-8416109953639059/5454698075' },
  reward_double_coins: { ios: 'ca-app-pub-8416109953639059/2065942394' },
};

const isRewarded = (placement: AdPlacement) => placement.startsWith('reward_');

const unitFor = (placement: AdPlacement): string | undefined => {
  if (__DEV__) return isRewarded(placement) ? TestIds.REWARDED : TestIds.INTERSTITIAL;
  const ids = UNIT_IDS[placement];
  return Platform.OS === 'ios' ? ids?.ios : ids?.android;
};

type Slot = { ad: InterstitialAd | RewardedAd; failures: number };

/** Listens for an event both ad kinds share (the union's overloads are not callable). */
const onShared = (
  ad: InterstitialAd | RewardedAd,
  type: AdEventType.CLOSED | AdEventType.ERROR,
  listener: () => void,
) => (ad as InterstitialAd).addAdEventListener(type, listener);

/** Waits longer after each failed load, up to five minutes. */
const retryDelay = (failures: number) => Math.min(300_000, 15_000 * 2 ** (failures - 1));

/**
 * Google AdMob. On start it asks for consent where the law requires it (Google's UMP form,
 * EU/UK), then for App Tracking Transparency on iOS, then preloads one ad per ad unit and
 * reloads each after it is shown. Placements sharing a unit share its preloaded ad.
 * Pacing stays in adFrequency.ts; this class only knows how to load and show.
 */
export class AdMobAdService implements AdService {
  private started = false;
  private showing = false;
  private readonly slots = new Map<string, Slot>();
  private readonly listeners = new Set<() => void>();

  async initialize() {
    if (this.started) return;
    this.started = true;

    try {
      await AdsConsent.gatherConsent();
    } catch (error) {
      console.warn('[ads] consent form failed', error);
    }
    if (Platform.OS === 'ios') {
      try {
        const { status } = await getTrackingPermissionsAsync();
        if (status === 'undetermined') await requestTrackingPermissionsAsync();
      } catch (error) {
        console.warn('[ads] tracking permission failed', error);
      }
    }
    const { canRequestAds } = await AdsConsent.getConsentInfo().catch(() => ({
      canRequestAds: false,
    }));
    if (!canRequestAds) return;

    await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.PG });
    await mobileAds().initialize();

    const placements = new Map<string, AdPlacement>();
    for (const placement of Object.keys(PLACEMENTS) as AdPlacement[]) {
      const unit = unitFor(placement);
      if (unit && !placements.has(unit)) placements.set(unit, placement);
    }
    for (const [unit, placement] of placements) this.createSlot(unit, placement);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  isRewardedReady(placement: AdPlacement) {
    return !this.showing && this.loadedSlot(placement) !== null;
  }

  canShowInterstitial(placement: AdPlacement) {
    return !this.showing && this.loadedSlot(placement) !== null;
  }

  async showInterstitial(placement: AdPlacement) {
    const slot = this.loadedSlot(placement);
    if (!slot || this.showing) return false;
    return this.present(slot, false);
  }

  async showRewarded(placement: AdPlacement) {
    const slot = this.loadedSlot(placement);
    if (!slot || this.showing) return false;
    return this.present(slot, true);
  }

  private loadedSlot(placement: AdPlacement) {
    const unit = unitFor(placement);
    const slot = unit ? this.slots.get(unit) : undefined;
    return slot?.ad.loaded ? slot : null;
  }

  private createSlot(unit: string, placement: AdPlacement) {
    const ad = isRewarded(placement)
      ? RewardedAd.createForAdRequest(unit)
      : InterstitialAd.createForAdRequest(unit);
    const slot: Slot = { ad, failures: 0 };
    this.slots.set(unit, slot);

    const onLoaded = () => {
      slot.failures = 0;
      this.notify();
    };
    if (ad instanceof RewardedAd) ad.addAdEventListener(RewardedAdEventType.LOADED, onLoaded);
    else ad.addAdEventListener(AdEventType.LOADED, onLoaded);
    onShared(ad, AdEventType.ERROR, () => {
      slot.failures += 1;
      this.notify();
      // Errors while showing are handled by present(), which reloads on its own.
      if (!this.showing) setTimeout(() => ad.load(), retryDelay(slot.failures));
    });
    ad.load();
  }

  /** Shows a loaded ad; resolves when it closes (with whether a reward was earned). */
  private present(slot: Slot, rewarded: boolean) {
    this.showing = true;
    this.notify();
    return new Promise<boolean>((resolve) => {
      let earned = false;
      const unsubscribe: (() => void)[] = [];
      const finish = (result: boolean) => {
        unsubscribe.forEach((off) => off());
        this.showing = false;
        this.notify();
        slot.ad.load();
        resolve(result);
      };
      if (rewarded) {
        unsubscribe.push(
          (slot.ad as RewardedAd).addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
            earned = true;
          }),
        );
      }
      unsubscribe.push(
        onShared(slot.ad, AdEventType.CLOSED, () => finish(rewarded ? earned : true)),
        onShared(slot.ad, AdEventType.ERROR, () => finish(false)),
      );
      slot.ad.show().catch(() => finish(false));
    });
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

/** Every placement, so initialize() can preload the units they use. */
const PLACEMENTS: Record<AdPlacement, true> = {
  level_complete_interstitial: true,
  restart_interstitial: true,
  reward_hint: true,
  reward_undo: true,
  reward_extra_prism: true,
  reward_skip_level: true,
  reward_double_coins: true,
};
