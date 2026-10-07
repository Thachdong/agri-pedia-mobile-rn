/**
 * The only place reading `process.env`. Expo inlines `EXPO_PUBLIC_*` at build time,
 * so every key must be read literally (`process.env.EXPO_PUBLIC_X`, never `process.env[name]`).
 * Values come from `.env` (see `.env.example`).
 */

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing env ${name}. Copy .env.example to .env and restart Metro (npx expo start -c).`);
  }
  return value.replace(/\/+$/, '');
}

export const env = {
  apiUrl: required(process.env.EXPO_PUBLIC_API_URL, 'EXPO_PUBLIC_API_URL'),
  socketUrl: required(process.env.EXPO_PUBLIC_SOCKET_URL, 'EXPO_PUBLIC_SOCKET_URL'),
  mapTileUrl: required(process.env.EXPO_PUBLIC_MAP_TILE_URL, 'EXPO_PUBLIC_MAP_TILE_URL'),
  isDev: __DEV__,
} as const;
