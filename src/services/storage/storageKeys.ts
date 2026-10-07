/** Versioned so a future shape change can migrate instead of misreading old data. */
export const STORAGE_KEYS = {
  progress: 'prismase.progress.v1',
  settings: 'prismase.settings.v1',
  adFrequency: 'prismase.adFrequency.v1',
} as const;
