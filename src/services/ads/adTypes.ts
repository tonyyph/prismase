export type AdPlacement =
  | 'level_complete_interstitial'
  | 'restart_interstitial'
  | 'reward_hint'
  | 'reward_undo'
  | 'reward_extra_prism'
  | 'reward_skip_level'
  | 'reward_double_coins';

export type RewardedPlacement = Extract<AdPlacement, `reward_${string}`>;
export type InterstitialPlacement = Extract<AdPlacement, `${string}_interstitial`>;

export interface AdService {
  initialize(): Promise<void>;
  /** Resolves true if an ad was shown. Never rejects. */
  showInterstitial(placement: AdPlacement): Promise<boolean>;
  /** Resolves true only if the user earned the reward. Never rejects. */
  showRewarded(placement: AdPlacement): Promise<boolean>;
  isRewardedReady(placement: AdPlacement): boolean;
  canShowInterstitial(): boolean;
}
