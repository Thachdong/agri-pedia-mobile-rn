import { useCallback, useState } from 'react';
import { getCurrentPosition } from '@/shared/lib/device';
import type { TGeoPoint } from '@/shared/types';

const UNAVAILABLE_MESSAGE = 'Không lấy được vị trí hiện tại. Hãy bật định vị, cấp quyền vị trí hoặc chọn trên bản đồ.';

/**
 * Current position on demand (never on mount). `request()` resolves the point, or null with `error` set
 * (location off / permission denied / timeout) — the user can still pick on the map.
 */
export function useCurrentPosition() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (): Promise<TGeoPoint | null> => {
    setIsLoading(true);
    setError(null);
    const point = await getCurrentPosition();
    setIsLoading(false);
    if (!point) setError(UNAVAILABLE_MESSAGE);
    return point;
  }, []);

  return { request, isLoading, error };
}
