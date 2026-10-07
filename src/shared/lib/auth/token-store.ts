import * as SecureStore from 'expo-secure-store';

export type TTokenPair = {
  accessToken: string;
  refreshToken: string;
};

/** Why the last session ended: the user logged out, or the server rejected the refresh token. */
export type TSessionEndReason = 'logout' | 'expired';

const STORAGE_KEY = 'agripedia.tokens';

type TListener = () => void;

let current: TTokenPair | null = null;
let loaded = false;
let endCount = 0;
let endReason: TSessionEndReason | null = null;
const listeners = new Set<TListener>();

function notify() {
  listeners.forEach((listener) => listener());
}

function isTokenPair(value: unknown): value is TTokenPair {
  const pair = value as TTokenPair | null;
  return typeof pair?.accessToken === 'string' && typeof pair.refreshToken === 'string';
}

/**
 * Access + refresh token, kept in the device keychain/keystore (expo-secure-store) and mirrored in memory
 * so request headers read them synchronously. The ONLY place tokens are stored — never AsyncStorage,
 * query cache, route params or logs.
 */
export const tokenStore = {
  /** Reads the keychain once at boot (root layout keeps the splash until it resolves). */
  async load(): Promise<void> {
    if (loaded) return;
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      current = isTokenPair(parsed) ? parsed : null;
    } catch {
      current = null;
    }
    loaded = true;
    notify();
  },

  isLoaded: () => loaded,

  get: (): TTokenPair | null => current,

  /** Keychain first: if it fails, memory keeps the previous pair and the error reaches the caller. */
  async set(pair: TTokenPair): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(pair));
    current = pair;
    notify();
  },

  /** Ends the session. Memory first (takes effect even if the keychain fails), then the keychain. */
  async clear(reason: TSessionEndReason = 'expired'): Promise<void> {
    if (!current) return;
    current = null;
    endCount += 1;
    endReason = reason;
    notify();
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  },

  /** Increments on every session end — lets a mounted screen tell "ended while I was open" from "already ended". */
  sessionEndCount: (): number => endCount,

  lastEndReason: (): TSessionEndReason | null => endReason,

  /** Fires on every change (login, rotation by refresh, logout) — realtime reconnects on it. */
  subscribe(listener: TListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** `useSyncExternalStore` snapshot: whether a session exists (stable primitive). */
  hasTokenSnapshot: (): boolean => current !== null,
};
