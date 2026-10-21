import type { TGeoPoint } from '@/shared/types';

/** Center of Vietnam — initial camera when there is no value and no position. */
export const VN_CENTER: TGeoPoint = { lat: 16.0471, long: 108.2062 };

/** Corners of Vietnam incl. Hoàng Sa / Trường Sa (SW, NE) — framed when there is no position (Specs/19102026 map-size.png, same as web). */
export const VN_BOUNDS: readonly [TGeoPoint, TGeoPoint] = [
  { lat: 8.0, long: 102.1 },
  { lat: 23.8, long: 115.8 },
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
