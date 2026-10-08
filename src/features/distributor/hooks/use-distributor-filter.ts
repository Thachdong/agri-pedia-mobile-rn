import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCurrentPosition } from '@/shared/lib/device';
import { toast } from '@/shared/lib/toast';
import type { TGeoPoint } from '@/shared/types';
import { LOCATE_WAIT_MS, NEAR_ME_FAILED_MESSAGE, USER_LABELS } from '../constants/distributor.constants';
import type { TNearbyDistributorsParams } from '../types/distributor.types';

/** `auto` = nothing chosen (guest: first-visit position, logged in: server uses the primary address). */
export type TDistributorFilter =
  | { kind: 'auto' }
  | { kind: 'near'; point: TGeoPoint }
  | { kind: 'province'; provinceCode: string };

/**
 * Who is looking: `pending` while the session loads (nothing requested yet), `guest` → ask the device position once,
 * `user` → send no location (server falls back to the primary address; `userAddress` only draws the viewer marker).
 */
export type TUseDistributorFilterOptions =
  | { viewer: 'pending' | 'guest' }
  | { viewer: 'user'; userAddress: TGeoPoint | null };

const AUTO: TDistributorFilter = { kind: 'auto' };
const NO_LOCATION: TNearbyDistributorsParams = {};

/**
 * Home "/" filter (ui-ux.md §6 (6)) → the params of the one nearby query map (5) and list (7) share (decision 5).
 * A point and a province never go together (API rule). `isInitializing` holds the query until the guest's
 * first-visit position resolves or LOCATE_WAIT_MS passes.
 */
export function useDistributorFilter(options: TUseDistributorFilterOptions) {
  const { viewer } = options;
  const userAddress = options.viewer === 'user' ? options.userAddress : null;

  const [filter, setFilter] = useState<TDistributorFilter>(AUTO);
  const [devicePoint, setDevicePoint] = useState<TGeoPoint | null>(null);
  const [isLocatingInitial, setIsLocatingInitial] = useState(true);
  const [isLocatingNear, setIsLocatingNear] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Guest, first visit: ask once. Denied / off / timeout → no location (nationwide), never an error.
  useEffect(() => {
    if (viewer !== 'guest') return;
    let active = true;
    const timer = setTimeout(() => setIsLocatingInitial(false), LOCATE_WAIT_MS);
    void getCurrentPosition().then((point) => {
      if (!active) return;
      clearTimeout(timer);
      if (point) setDevicePoint(point);
      setIsLocatingInitial(false);
    });
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [viewer]);

  const nearMe = useCallback(async () => {
    setIsLocatingNear(true);
    const point = await getCurrentPosition();
    if (!mountedRef.current) return;
    setIsLocatingNear(false);
    if (!point) {
      toast.error(NEAR_ME_FAILED_MESSAGE);
      return;
    }
    setDevicePoint(point);
    setFilter({ kind: 'near', point });
  }, []);

  const setProvince = useCallback((provinceCode: string) => setFilter({ kind: 'province', provinceCode }), []);
  const clear = useCallback(() => setFilter(AUTO), []);

  const autoPoint = viewer === 'guest' ? devicePoint : null;

  const params = useMemo<TNearbyDistributorsParams>(() => {
    if (filter.kind === 'near') return { lat: filter.point.lat, long: filter.point.long };
    if (filter.kind === 'province') return { provinceCode: filter.provinceCode };
    return autoPoint ? { lat: autoPoint.lat, long: autoPoint.long } : NO_LOCATION;
  }, [filter, autoPoint]);

  const viewerMarker = useMemo(() => {
    if (filter.kind === 'near') return { point: filter.point, label: USER_LABELS.device };
    if (autoPoint) return { point: autoPoint, label: USER_LABELS.device };
    if (userAddress) return { point: userAddress, label: USER_LABELS.profile };
    return null;
  }, [filter, autoPoint, userAddress]);

  return {
    filter,
    params,
    /** Viewer marker for the map, or null (guest without a position, user without an address). */
    viewerMarker,
    /** True while the query must wait: session loading, or the guest's first-visit position. */
    isInitializing: viewer === 'pending' || (viewer === 'guest' && isLocatingInitial),
    isLocatingNear,
    nearMe,
    setProvince,
    clear,
  };
}
