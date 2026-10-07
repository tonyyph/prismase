import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';

import { getSettings } from '../store/gameStore';

export type HapticKind = 'select' | 'move' | 'invalid' | 'success' | 'tap';

/** Fire-and-forget haptics that respect the setting and never throw. */
export const haptic = (kind: HapticKind) => {
  if (!getSettings().hapticsEnabled) return;
  const run = () => {
    switch (kind) {
      case 'tap':
      case 'select':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'move':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'invalid':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      case 'success':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  run().catch(() => undefined);
};

export const useHaptics = () => useMemo(() => ({ haptic }), []);
