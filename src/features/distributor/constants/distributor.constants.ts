import type { TNearbyScope } from '../types/distributor.types';

/**
 * Longest wait for the location permission / first fix on the guest's first visit (the dialog may be ignored).
 * Past it the nationwide list loads; a position arriving later is still used (new query key, reload).
 */
export const LOCATE_WAIT_MS = 8_000;

/** Callout of the viewer marker by where the position came from. Same text as web. */
export const USER_LABELS = {
  device: 'Bạn ở đây',
  profile: 'Địa chỉ của bạn',
} as const;

export const NEAR_ME_FAILED_MESSAGE = 'Không lấy được vị trí hiện tại. Hãy bật định vị và cấp quyền vị trí cho ứng dụng.';

/**
 * Note above the list when the server had to widen the search. `nationwide` is only a fallback when an area was
 * asked for (source `query_area`); with no location at all it is the normal result → no note.
 */
export const NEARBY_FALLBACK_NOTES = {
  nationwide_by_distance: 'Không có nhà phân phối trong bán kính 30 km — đang hiển thị nơi gần nhất.',
  nationwide: 'Tỉnh/thành này chưa có nhà phân phối — đang hiển thị toàn quốc.',
} as const satisfies Partial<Record<TNearbyScope, string>>;
