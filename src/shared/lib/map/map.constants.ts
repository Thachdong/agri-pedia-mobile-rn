import type { TGeoPoint } from '@/shared/types';

/** Center of Vietnam — initial camera when there is no value and no position. */
export const VN_CENTER: TGeoPoint = { lat: 16.0471, long: 108.2062 };

/** Corners of mainland Vietnam (SW, NE) — framed when there is no position. Islands left out so the mainland fills the view. */
export const VN_BOUNDS: readonly [TGeoPoint, TGeoPoint] = [
  { lat: 8.4, long: 102.1 },
  { lat: 23.4, long: 109.5 },
];

/** Latitude span of the camera. Country ≈ whole VN, province ≈ one province around the viewer, city ≈ one district (a single result), street ≈ a few blocks (picking an address). */
export const MAP_ZOOM = {
  country: 12,
  province: 1.2,
  city: 0.2,
  street: 0.01,
} as const;

/** OSM tile usage policy: attribution must be visible on the map. */
export const OSM_ATTRIBUTION = '© OpenStreetMap contributors';
