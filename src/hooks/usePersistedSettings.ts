import { useGameStore } from '../store/gameStore';

/** Settings are loaded at boot and saved on every change by the store. */
export const usePersistedSettings = () => {
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  return { settings, updateSettings };
};

/** Animations are skipped entirely when the player asks for reduced motion. */
export const useReducedMotion = () => useGameStore((s) => s.settings.reducedMotion);
