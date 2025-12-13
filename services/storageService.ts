
export const STORAGE_KEYS = {
  DATA_PREFIX: 'fml_data_',
  AUDIO_PREFIX: 'fml_audio_',
};

export const cleanKey = (key: string): string => {
  return key.trim().toLowerCase().replace(/\s+/g, '_');
};

export const saveToCache = (key: string, data: any): boolean => {
  try {
    const serialized = JSON.stringify({
      timestamp: Date.now(),
      payload: data
    });
    localStorage.setItem(key, serialized);
    console.log(`[Storage] Saved to local cache: ${key}`);
    return true;
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn('[Storage] Local storage is full. Unable to cache new data.');
      // Optional strategy: clear old entries here if needed, but for now we just warn
    } else {
      console.error('[Storage] Error saving to cache:', e);
    }
    return false;
  }
};

export const loadFromCache = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    // We could check parsed.timestamp here for expiration if desired
    console.log(`[Storage] Retrieved from local cache: ${key}`);
    return parsed.payload as T;
  } catch (e) {
    console.error('[Storage] Error loading from cache:', e);
    return null;
  }
};
