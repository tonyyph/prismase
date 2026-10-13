import type { AdService } from './adTypes';
import { MockAdService } from './mockAdService';

/**
 * The single place that chooses the ad network: AdMob when EXPO_PUBLIC_ADS_PROVIDER=admob
 * (set for EAS builds in eas.json), otherwise the on-screen mock. AdMob is required lazily so
 * dev clients and tests without its native module keep working on the mock.
 */
const createAdService = (): AdService => {
  if (process.env.EXPO_PUBLIC_ADS_PROVIDER === 'admob') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy: native module
    const { AdMobAdService } = require('./admobAdService') as typeof import('./admobAdService');
    return new AdMobAdService();
  }
  return new MockAdService();
};

export const adService: AdService = createAdService();

export const mockAdService = adService instanceof MockAdService ? adService : null;
