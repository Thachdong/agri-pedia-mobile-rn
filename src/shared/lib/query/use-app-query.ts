import {
  useInfiniteQuery,
  useQuery,
  type DefaultError,
  type InfiniteData,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';

export function useAppQuery<TQueryFnData, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
  options: UseQueryOptions<TQueryFnData, DefaultError, TData, TQueryKey>,
) {
  return useQuery(options);
}

/** Cursor pagination (`cursor` / `nextCursor`): `getNextPageParam: (page) => page.nextCursor ?? undefined`. */
export function useAppInfiniteQuery<
  TQueryFnData,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(options: UseInfiniteQueryOptions<TQueryFnData, DefaultError, TData, TQueryKey, TPageParam>) {
  return useInfiniteQuery(options);
}
