import { useEffect, useState } from 'react';

import { adService, mockAdService } from '../services/ads/adService';
import type { AdPlacement } from '../services/ads/adTypes';
import type { MockAdRequest } from '../services/ads/mockAdService';
import { useGameStore } from '../store/gameStore';

/** Whether a rewarded ad could be offered for a placement. Re-checked when busy state changes. */
export const useRewardedReady = (placement: AdPlacement) => {
  useGameStore((s) => s.busy);
  return adService.isRewardedReady(placement);
};

/** Connects the mock ad network to the on-screen placeholder. */
export const useMockAdPresenter = () => {
  const [request, setRequest] = useState<MockAdRequest | null>(null);
  useEffect(() => {
    if (!mockAdService) return undefined;
    mockAdService.setPresenter(setRequest);
    return () => mockAdService?.setPresenter(null);
  }, []);
  const finish = (result: boolean) => request?.finish(result);
  return { request, finish };
};
