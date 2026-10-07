import * as SecureStore from 'expo-secure-store';
import { tokenStore } from './token-store';

const PAIR = { accessToken: 'a', refreshToken: 'r' };

describe('tokenStore', () => {
  beforeEach(async () => {
    await tokenStore.clear();
  });

  it('persists to secure store and notifies subscribers', async () => {
    const listener = jest.fn();
    const unsubscribe = tokenStore.subscribe(listener);

    await tokenStore.set(PAIR);

    expect(tokenStore.get()).toEqual(PAIR);
    expect(tokenStore.hasTokenSnapshot()).toBe(true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('agripedia.tokens', JSON.stringify(PAIR));
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('clears memory + secure store and notifies', async () => {
    await tokenStore.set(PAIR);
    const listener = jest.fn();
    const unsubscribe = tokenStore.subscribe(listener);

    await tokenStore.clear();

    expect(tokenStore.get()).toBeNull();
    expect(tokenStore.hasTokenSnapshot()).toBe(false);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('agripedia.tokens');
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  describe('load', () => {
    // load() runs once per process; isolate the module to start from "not loaded".
    const freshStore = () => {
      let store!: typeof tokenStore;
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest module isolation needs a sync require
        store = (require('./token-store') as typeof import('./token-store')).tokenStore;
      });
      return store;
    };

    it('restores a stored pair', async () => {
      await SecureStore.setItemAsync('agripedia.tokens', JSON.stringify(PAIR));
      const store = freshStore();

      await store.load();

      expect(store.isLoaded()).toBe(true);
      expect(store.get()).toEqual(PAIR);
    });

    it.each(['{broken', JSON.stringify({ accessToken: 1 })])('treats corrupt data %p as no session', async (raw) => {
      await SecureStore.setItemAsync('agripedia.tokens', raw);
      const store = freshStore();

      await store.load();

      expect(store.isLoaded()).toBe(true);
      expect(store.get()).toBeNull();
    });
  });
});
