import { type AdFrequencyState, sanitizeAdFrequency } from '../ads/adFrequency';
import { sanitizeProgress } from '../../game/progress';
import type { PlayerProgress } from '../../game/types';
import { readJson, removeKeys, writeJson } from './jsonStorage';
import { STORAGE_KEYS } from './storageKeys';

export const loadProgress = async (): Promise<PlayerProgress> =>
  sanitizeProgress(await readJson(STORAGE_KEYS.progress));

export const saveProgress = (progress: PlayerProgress) =>
  writeJson(STORAGE_KEYS.progress, progress);

export const loadAdFrequency = async (): Promise<AdFrequencyState> =>
  sanitizeAdFrequency(await readJson(STORAGE_KEYS.adFrequency));

export const saveAdFrequency = (state: AdFrequencyState) =>
  writeJson(STORAGE_KEYS.adFrequency, state);

export const clearProgress = () => removeKeys([STORAGE_KEYS.progress]);
