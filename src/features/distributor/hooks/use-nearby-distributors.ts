import { useAppInfiniteQuery } from '@/shared/lib/query';
import type { TNearbyDistributorsParams, TNearbyDistributorsResponse, TNearbyDistributorsView } from '../types/distributor.types';
import { nearbyDistributorsQuery } from './distributor.queries';

const toView = ({ pages }: { pages: TNearbyDistributorsResponse[] }): TNearbyDistributorsView => ({
  scope: pages[0]?.scope ?? 'nationwide',
  source: pages[0]?.source ?? 'none',
  total: pages[0]?.total ?? 0,
  items: pages.flatMap((page) => page.items),
});

/**
 * Distributors for the home filter — map (5) and list (7) share this one result (decision 5).
 * `enabled: false` while the initial location is still resolving, so the list is not fetched twice.
 */
export const useNearbyDistributors = (params: TNearbyDistributorsParams, { enabled = true }: { enabled?: boolean } = {}) =>
  useAppInfiniteQuery({ ...nearbyDistributorsQuery(params), select: toView, enabled });
