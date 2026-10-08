import * as Location from 'expo-location';
import type { TGeoPoint } from '@/shared/types';

const POSITION_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Current position, asking for the when-in-use permission if needed.
 * Location off, permission denied, no fix within 15s or any native error → null. Never throws to the UI:
 * callers fall back (e.g. pick on the map).
 */
export async function getCurrentPosition(): Promise<TGeoPoint | null> {
  try {
    if (!(await Location.hasServicesEnabledAsync())) return null;

    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return null;

    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      POSITION_TIMEOUT_MS,
    );
    if (!position) return null;
    return { lat: position.coords.latitude, long: position.coords.longitude };
  } catch {
    return null;
  }
}
