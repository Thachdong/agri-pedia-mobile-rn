import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSession } from '@/features/auth';
import { Icon } from '@/shared/components/atoms';
import { AppMap, MAP_ZOOM, type TAppMapHandle, type TMapMarker } from '@/shared/lib/map';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
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
  /** False until the map block was scrolled into view: no map, no location prompt, no search before that. */
  active: boolean;
  /** The section reports where it sits in the scroll content; the list reports the scroll position. */
  reportSectionOffset: (y: number) => void;
  onListScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  ownShopId?: string;
};

const ExplorerContext = createContext<TExplorerContext | null>(null);

function useExplorer() {
  const context = use(ExplorerContext);
  if (!context) throw new Error('DistributorExplorer* must be inside <DistributorExplorerProvider>');
  return context;
}

/**
 * Session → who is looking (guest asks the device position, a logged-in user relies on the primary address).
 * Not active yet → `pending`: nothing asked, nothing fetched (Specs/19102026: init when the map shows).
 */
function useViewer(active: boolean): TUseDistributorFilterOptions {
  const session = useSession();
  const address = session.user?.address ?? null;
  const userAddress = useMemo<TGeoPoint | null>(
    () => (address ? { lat: address.lat, long: address.long } : null),
    [address],
  );
  if (!active) return { viewer: 'pending' };
  if (session.status === 'authenticated') return { viewer: 'user', userAddress };
  return { viewer: session.status === 'loading' ? 'pending' : 'guest' };
}

/** Lazy start of the explorer: active once the section top enters the window (scroll + window height), then for good. */
function useActivateOnView() {
  const { height } = useWindowDimensions();
  const [active, setActive] = useState(false);
  const sectionYRef = useRef<number | null>(null);
  const scrollYRef = useRef(0);

  const check = useCallback(() => {
    const y = sectionYRef.current;
    if (y !== null && y <= scrollYRef.current + height) setActive(true);
  }, [height]);

  const reportSectionOffset = useCallback(
    (y: number) => {
      sectionYRef.current = y;
      check();
    },
    [check],
  );

  const onListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollYRef.current = event.nativeEvent.contentOffset.y;
      if (!active) check();
    },
    [active, check],
  );

  return { active, reportSectionOffset, onListScroll };
}

export type TDistributorExplorerProviderProps = {
  /** Logged-in DISTRIBUTOR: its shop pinned first in the list, the other shops not openable. */
  ownShopId?: string;
  children: ReactNode;
};

/**
 * Shared state of home "/" (ui-ux.md §6): filter (6) → one nearby query → map (5) + list (7) (decision 5), plus the
 * distributor selected on the map. Lazy (Specs/19102026): starts when the section scrolls into view. The page puts
 * the Section (title, map, filter) in the List header.
 */
export function DistributorExplorerProvider({ ownShopId, children }: TDistributorExplorerProviderProps) {
  const { active, reportSectionOffset, onListScroll } = useActivateOnView();
  const viewer = useViewer(active);
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
      active,
      reportSectionOffset,
      onListScroll,
      ownShopId,
    }),
    [
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
      active,
      reportSectionOffset,
      onListScroll,
      ownShopId,
    ],
  );

  return <ExplorerContext value={value}>{children}</ExplorerContext>;
}

/** Map (5): placeholder until active, then mounted with its markers. */
export function DistributorExplorerMap({ className }: { className?: string }) {
  const { active } = useExplorer();
  if (!active) {
    return (
      <View
        accessibilityLabel="Bản đồ nhà phân phối"
        className={cn('items-center justify-center gap-2 bg-surface', className)}
      >
        <Icon name="map-outline" size="lg" color="mutedForeground" />
      </View>
    );
  }
  return <ExplorerMap className={className} />;
}

/** One marker per distributor + the viewer; tap a marker → select it in the list; reframes on a new filter. */
function ExplorerMap({ className }: { className?: string }) {
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

/**
 * Section of the home scroll: title, map (5), filter (6). Must be a direct child of the List `header` root so its
 * layout `y` is its offset in the scroll content (lazy start).
 */
export function DistributorExplorerSection({ className }: { className?: string }) {
  const { reportSectionOffset } = useExplorer();
  return (
    <View
      testID="distributor-explorer-section"
      onLayout={(event: LayoutChangeEvent) => reportSectionOffset(event.nativeEvent.layout.y)}
      className={cn('gap-3', className)}
    >
      <Text accessibilityRole="header" className={cn(TEXT.titleMedium, 'text-foreground')}>
        Nhà phân phối
      </Text>
      <View className="h-72 overflow-hidden rounded-xl border border-border-subtle">
        <DistributorExplorerMap className="flex-1" />
      </View>
      <DistributorExplorerFilter />
    </View>
  );
}

/** Distributor list (7) — the scroll of the page; `header` sits above it (home: diagnosis, articles, Section). */
export function DistributorExplorerList({ header, className }: { header?: ReactElement | null; className?: string }) {
  const { query, selectedId, ownShopId, onListScroll } = useExplorer();
  return (
    <DistributorList
      query={query}
      selectedId={selectedId}
      ownShopId={ownShopId}
      header={header}
      onScroll={onListScroll}
      className={className}
    />
  );
}
