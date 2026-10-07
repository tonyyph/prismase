import AsyncStorage from '@react-native-async-storage/async-storage';

/** Reads JSON, returning undefined on a missing key, bad JSON or a storage failure. */
export const readJson = async (key: string): Promise<unknown> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] could not read ${key}`, error);
    return undefined;
  }
};

/** Writes JSON. Returns false instead of throwing, so gameplay never breaks on a full disk. */
export const writeJson = async (key: string, value: unknown): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] could not write ${key}`, error);
    return false;
  }
};

export const removeKeys = async (keys: string[]) => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.warn('[storage] could not remove keys', error);
  }
};
