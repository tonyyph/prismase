import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useEffect } from 'react';

import type { BoardEvent } from '../game/types';
import { getSettings, useGameStore } from '../store/gameStore';
import { haptic } from './useHaptics';

const SOUNDS = {
  select: require('../../assets/sounds/select.wav'),
  move: require('../../assets/sounds/move.wav'),
  invalid: require('../../assets/sounds/invalid.wav'),
  complete: require('../../assets/sounds/complete.wav'),
  win: require('../../assets/sounds/win.wav'),
  coin: require('../../assets/sounds/coin.wav'),
} as const;

export type SoundName = keyof typeof SOUNDS;

const VOLUME: Partial<Record<SoundName, number>> = { select: 0.4, move: 0.55, invalid: 0.45 };

/** The sound and haptic for one board event. Exported for tests. */
export const feedbackForEvent = (
  event: BoardEvent,
): { sound?: SoundName; haptic?: 'select' | 'move' | 'invalid' | 'success' } => {
  switch (event.kind) {
    case 'select':
      return { sound: 'select', haptic: 'select' };
    case 'move':
      if (event.levelComplete) return { sound: 'win', haptic: 'success' };
      if (event.completedContainer) return { sound: 'complete', haptic: 'success' };
      return { sound: 'move', haptic: 'move' };
    case 'invalid':
      return { sound: 'invalid', haptic: 'invalid' };
    case 'undo':
    case 'extraPrism':
      return { sound: 'move', haptic: 'select' };
    default:
      return {};
  }
};

let players: Partial<Record<SoundName, AudioPlayer>> = {};

/** Plays a sound if enabled. Missing or failing players stay silent. */
export const playSound = (name: SoundName) => {
  if (!getSettings().soundEnabled) return;
  const player = players[name];
  if (!player) return;
  try {
    player.seekTo(0).catch(() => undefined);
    player.play();
  } catch {
    // Audio must never interrupt play.
  }
};

/** Loads effects once and plays board feedback (sound + haptics) as events arrive. */
export const useSoundEffects = () => {
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(
      () => undefined,
    );
    const loaded: Partial<Record<SoundName, AudioPlayer>> = {};
    for (const name of Object.keys(SOUNDS) as SoundName[]) {
      try {
        const player = createAudioPlayer(SOUNDS[name]);
        player.volume = VOLUME[name] ?? 0.7;
        loaded[name] = player;
      } catch {
        // A missing asset only means that effect is silent.
      }
    }
    players = loaded;

    const unsubscribe = useGameStore.subscribe((state, previous) => {
      const event = state.level?.lastEvent;
      if (!event || event === previous.level?.lastEvent) return;
      const feedback = feedbackForEvent(event);
      if (feedback.sound) playSound(feedback.sound);
      if (feedback.haptic) haptic(feedback.haptic);
    });
    const unsubscribeCoins = useGameStore.subscribe((state, previous) => {
      if (state.coinPulse !== previous.coinPulse && state.status !== 'levelComplete') {
        playSound('coin');
      }
    });

    return () => {
      unsubscribe();
      unsubscribeCoins();
      Object.values(loaded).forEach((player) => player?.release());
      players = {};
    };
  }, []);
};
