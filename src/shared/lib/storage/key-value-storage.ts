import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'agripedia:';

/**
 * Non-secret local persistence (handoff, UI preferences). JSON in, JSON out.
 * Never store tokens here — they live in the secure token store (shared/lib/auth).
 */
export const keyValueStorage = {
  /** Missing key, unreadable storage or corrupt JSON → null (never throws to callers). */
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  },

  async setJson(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(PREFIX + key);
  },
};

export type TKeyValueStorage = typeof keyValueStorage;
