import type { TGeoPoint } from '@/shared/types';

/** Center of Vietnam — initial camera when there is no value and no position. */
export const VN_CENTER: TGeoPoint = { lat: 16.0471, long: 108.2062 };

/** Latitude span of the camera. Country ≈ whole VN, city ≈ one district (a single result), street ≈ a few blocks (picking an address). */
export const MAP_ZOOM = {
  country: 12,
  city: 0.2,
  street: 0.01,
} as const;

/** OSM tile usage policy: attribution must be visible on the map. */
export const OSM_ATTRIBUTION = '© OpenStreetMap contributors';
