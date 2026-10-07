import { DEFAULT_SETTINGS } from '../../game/constants';
import type { Settings } from '../../game/types';
import { readJson, writeJson } from './jsonStorage';
import { STORAGE_KEYS } from './storageKeys';

export const sanitizeSettings = (raw: unknown): Settings => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const bool = (key: keyof Settings) =>
    typeof r[key] === 'boolean' ? (r[key] as boolean) : DEFAULT_SETTINGS[key];
  return {
    soundEnabled: bool('soundEnabled'),
    hapticsEnabled: bool('hapticsEnabled'),
    reducedMotion: bool('reducedMotion'),
    hintAnimation: bool('hintAnimation'),
  };
};

export const loadSettings = async (): Promise<Settings> =>
  sanitizeSettings(await readJson(STORAGE_KEYS.settings));

export const saveSettings = (settings: Settings) => writeJson(STORAGE_KEYS.settings, settings);
