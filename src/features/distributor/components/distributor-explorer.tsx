import { createContext, use, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSession } from '@/features/auth';
import { AppMap, MAP_ZOOM, type TAppMapHandle, type TMapMarker } from '@/shared/lib/map';
import type { TGeoPoint } from '@/shared/types';
import {
  useDistributorFilter,
  type TDistributorFilter,
  type TUseDistributorFilterOptions,
} from '../hooks/use-distributor-filter';
import { useNearbyDistributors } from '../hooks/use-nearby-distributors';
import type { TNearbyDistributorsParams } from '../types/distributor.types';
import { DistributorFilter } from './distributor-filter';
import { DistributorList } from './distributor-list';

type TExplorerContext = {
  query: ReturnType<typeof useNearbyDistributors>;
  params: TNearbyDistributorsParams;
  filter: TDistributorFilter;
  viewerMarker: { point: TGeoPoint; label: string } | null;
  isInitializing: boolean;
  isLocatingNear: boolean;
  nearMe: () => Promise<void>;
  setProvince: (provinceCode: string) => void;
  clear: () => void;
  selectedId: string | null;
  select: (id: string | null) => void;
};

const ExplorerContext = createContext<TExplorerContext | null>(null);

function useExplorer() {
  const context = use(ExplorerContext);
  if (!context) throw new Error('DistributorExplorer* must be inside <DistributorExplorerProvider>');
  return context;
}

/** Session → who is looking (guest asks the device position, a logged-in user relies on the primary address). */
function useViewer(): TUseDistributorFilterOptions {
  const session = useSession();
  const address = session.user?.address ?? null;
  const userAddress = useMemo<TGeoPoint | null>(
    () => (address ? { lat: address.lat, long: address.long } : null),
    [address],
  );
  if (session.status === 'authenticated') return { viewer: 'user', userAddress };
  return { viewer: session.status === 'loading' ? 'pending' : 'guest' };
}

/**
 * Shared state of home "/" (ui-ux.md §6): filter (6) → one nearby query → map (5) + list (7) (decision 5), plus the
 * distributor selected on the map. The page places Map / Filter / List into the MapListLayout slots.
 */
export function DistributorExplorerProvider({ children }: { children: ReactNode }) {
  const viewer = useViewer();
  const { params, filter, viewerMarker, isInitializing, isLocatingNear, nearMe, setProvince, clear } =
    useDistributorFilter(viewer);
  const query = useNearbyDistributors(params, { enabled: !isInitializing });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectionParams, setSelectionParams] = useState(params);

  // New filter → the old selection may not be in the result any more (state adjusted during render).
  if (selectionParams !== params) {
    setSelectionParams(params);
    setSelectedId(null);
  }

  const value = useMemo<TExplorerContext>(
    () => ({
      query,
      params,
      filter,
      viewerMarker,
      isInitializing,
      isLocatingNear,
      nearMe,
      setProvince,
      clear,
      selectedId,
      select: setSelectedId,
    }),
    [query, params, filter, viewerMarker, isInitializing, isLocatingNear, nearMe, setProvince, clear, selectedId],
  );

  return <ExplorerContext value={value}>{children}</ExplorerContext>;
}

/** Map (5): one marker per distributor + the viewer; tap a marker → select it in the list; reframes on a new filter. */
export function DistributorExplorerMap({ className }: { className?: string }) {
  const { query, params, filter, viewerMarker, selectedId, select } = useExplorer();
  const mapRef = useRef<TAppMapHandle>(null);
  const lastParamsRef = useRef<TNearbyDistributorsParams | null>(null);
  const needsFitRef = useRef(true);
  const items = query.data?.items;

  const markers = useMemo<TMapMarker[]>(
    () =>
      items?.map(({ userId, username, address }) => ({
        id: userId,
        point: { lat: address.lat, long: address.long },
        title: username,
      })) ?? [],
    [items],
  );

  // Frame once per filter change, when its first page is there (fetched or cached) — not on next pages / refetch.
  useEffect(() => {
    if (lastParamsRef.current !== params) {
      lastParamsRef.current = params;
      needsFitRef.current = true;
    }
    if (!needsFitRef.current || !query.isSuccess) return;
    needsFitRef.current = false;
    const map = mapRef.current;
    if (!map) return;
    // Province → its distributors. Otherwise centered on the viewer at province level (spec: "vị trí farmer nếu có");
    // no position → the whole country.
    if (filter.kind === 'province') {
      if (markers.length > 0) map.fitTo(markers.map((marker) => marker.point));
      else map.showCountry();
    } else if (viewerMarker) {
      map.animateTo(viewerMarker.point, MAP_ZOOM.province);
    } else {
      map.showCountry();
    }
  }, [query.isSuccess, params, filter, markers, viewerMarker]);

  return (
    <AppMap
      ref={mapRef}
      markers={markers}
      selectedId={selectedId}
      userLocation={viewerMarker?.point}
      userLabel={viewerMarker?.label}
      onMarkerPress={select}
      accessibilityLabel="Bản đồ nhà phân phối"
      className={className}
    />
  );
}

/** Search and filter (6). */
export function DistributorExplorerFilter({ className }: { className?: string }) {
  const { filter, isInitializing, isLocatingNear, nearMe, setProvince, clear } = useExplorer();
  return (
    <DistributorFilter
      filter={filter}
      isLocatingNear={isLocatingNear}
      onProvinceChange={setProvince}
      onNearMe={() => void nearMe()}
      onClear={clear}
      disabled={isInitializing}
      className={className}
    />
  );
}

/** Distributor list (7). */
export function DistributorExplorerList({ className }: { className?: string }) {
  const { query, selectedId } = useExplorer();
  return <DistributorList query={query} selectedId={selectedId} className={className} />;
}
