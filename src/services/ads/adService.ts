import { AdMobAdService } from './admobAdService';
import type { AdService } from './adTypes';
import { MockAdService } from './mockAdService';

/**
 * The single place that chooses the ad network. Set EXPO_PUBLIC_ADS_PROVIDER=admob once
 * AdMobAdService is implemented; everything else talks to the AdService interface.
 */
const createAdService = (): AdService =>
  process.env.EXPO_PUBLIC_ADS_PROVIDER === 'admob' ? new AdMobAdService() : new MockAdService();

export const adService: AdService = createAdService();

export const mockAdService = adService instanceof MockAdService ? adService : null;
