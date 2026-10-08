// Global mocks for jest-expo. Env values come from here, not from .env (tests must not depend on a developer's .env).
process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
process.env.EXPO_PUBLIC_SOCKET_URL = 'http://api.test';
process.env.EXPO_PUBLIC_MAP_TILE_URL = 'https://tiles.test/{z}/{x}/{y}.png';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// In-memory keychain.
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    __reset: () => store.clear(),
  };
});

// Animations / sheets: library mocks render content inline (an AppSheet's content is always mounted in tests).
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));

// Native map → plain Views (src/test-utils/react-native-maps.mock.tsx).
jest.mock('react-native-maps', () => require('./src/test-utils/react-native-maps.mock'));
