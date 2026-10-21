import { appInfiniteQueryOptions, appQueryOptions, queryKeys } from '@/shared/lib/query';
import { getCategories, getDistributorProducts, getProductDetail } from '../services/product.service';

export const PRODUCTS_PAGE_SIZE = 20;

/** Signed media URLs expire (~1h) → keep product data fresh well inside that. */
const PRODUCT_STALE_MS = 5 * 60_000;

/** ACTIVE products of a shop, newest first, cursor pages. `silent`: the list shows errors inline. */
export const distributorProductsQuery = (distributorId: string) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.products.list(distributorId),
    queryFn: ({ pageParam, signal }) =>
      getDistributorProducts({ distributorId, cursor: pageParam, limit: PRODUCTS_PAGE_SIZE }, signal),
    staleTime: PRODUCT_STALE_MS,
    meta: { silent: true },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });

/** One product (detail page + edit form prefill). `silent`: the page shows errors inline (404 → not found). */
export const productDetailQuery = (productId: string) =>
  appQueryOptions({
    queryKey: queryKeys.products.detail(productId),
    queryFn: ({ signal }) => getProductDetail(productId, signal),
    staleTime: PRODUCT_STALE_MS,
    meta: { silent: true },
  });

/** Master data, doesn't change within a session → never stale. `silent`: callers show a failure inline. */
export const categoriesQuery = () =>
  appQueryOptions({
    queryKey: queryKeys.products.categories(),
    queryFn: ({ signal }) => getCategories(signal),
    select: (data) => data.items,
    staleTime: Infinity,
    meta: { silent: true },
  });
