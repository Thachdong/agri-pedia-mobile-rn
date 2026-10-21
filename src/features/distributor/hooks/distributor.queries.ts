import { appInfiniteQueryOptions, queryKeys } from '@/shared/lib/query';
import { getNearbyDistributors } from '../services/distributor.service';
import type { TNearbyDistributorsParams } from '../types/distributor.types';

export const NEARBY_DISTRIBUTORS_PAGE_SIZE = 20;

/**
 * Page-based (not cursor): the next page exists until `total` items are loaded or a page comes back empty.
 * `silent`: the list shows errors inline (InfiniteList) → no global toast on top.
 */
export const nearbyDistributorsQuery = (params: TNearbyDistributorsParams) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.distributors.nearby(params),
    queryFn: ({ pageParam, signal }) =>
      getNearbyDistributors({ ...params, page: pageParam, limit: NEARBY_DISTRIBUTORS_PAGE_SIZE }, signal),
    meta: { silent: true },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((count, page) => count + page.items.length, 0);
      return lastPage.items.length > 0 && loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });
