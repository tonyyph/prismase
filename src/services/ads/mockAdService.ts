import type { AdPlacement, AdService } from './adTypes';

export type MockAdRequest = {
  /** Unique per request, so the overlay can restart its countdown for each ad. */
  id: number;
  kind: 'interstitial' | 'rewarded';
  placement: AdPlacement;
  /** For rewarded ads, `true` means the reward was earned. */
  finish: (result: boolean) => void;
};

/** Receives the ad to show, and null once it has ended. */
type Presenter = (request: MockAdRequest | null) => void;

/**
 * Stands in for a real network during development. When the app has registered a presenter
 * (MockAdOverlay), ads render as a full-screen placeholder with a countdown, so the reward and
 * pacing flows can be felt end to end. Without one (tests), ads resolve immediately.
 */
export class MockAdService implements AdService {
  private initialized = false;
  private presenter: Presenter | null = null;
  private showing = false;
  private nextId = 1;
  private current: MockAdRequest | null = null;

  constructor(private readonly options: { fillRate?: number; random?: () => number } = {}) {}

  /** Dev/QA helper: resolves the ad on screen as if the user finished or closed it. */
  finishCurrent(result: boolean) {
    this.current?.finish(result);
  }

  setPresenter(presenter: Presenter | null) {
    this.presenter = presenter;
  }

  async initialize() {
    this.initialized = true;
  }

  isRewardedReady(_placement: AdPlacement) {
    return this.initialized && !this.showing && this.filled();
  }

  canShowInterstitial() {
    return this.initialized && !this.showing;
  }

  showInterstitial(placement: AdPlacement) {
    return this.present('interstitial', placement);
  }

  showRewarded(placement: AdPlacement) {
    return this.present('rewarded', placement);
  }

  private filled() {
    const { fillRate = 1, random = Math.random } = this.options;
    return fillRate >= 1 || random() < fillRate;
  }

  private present(kind: MockAdRequest['kind'], placement: AdPlacement): Promise<boolean> {
    if (!this.initialized || this.showing) return Promise.resolve(false);
    const presenter = this.presenter;
    if (!presenter) return Promise.resolve(true);
    this.showing = true;
    return new Promise((resolve) => {
      const request: MockAdRequest = {
        id: this.nextId++,
        kind,
        placement,
        finish: (result) => {
          if (this.current !== request) return;
          this.current = null;
          this.showing = false;
          this.presenter?.(null);
          resolve(result);
        },
      };
      this.current = request;
      presenter(request);
    });
  }
}
