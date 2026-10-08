import type { TApiPaths, TApiSchema } from '@/shared/lib/http';

/** One distributor of GET /distributors/nearby — `address.province`/`ward` are codenames, `avatar` a media id. */
export type TNearbyDistributor = TApiSchema<'NearbyDistributorResponse'>;
export type TNearbyDistributorsResponse = TApiSchema<'FindNearbyDistributorsResponse'>;
/** Stage the server listed from (`radius` → `nationwide_by_distance`, `province` → `nationwide`). */
export type TNearbyScope = TNearbyDistributorsResponse['scope'];

type TNearbyQuery = NonNullable<TApiPaths['/distributors/nearby']['get']['parameters']['query']>;

/** Location filter — a point (`lat` + `long`) or an area (`provinceCode`), never both. `page`/`limit` belong to the infinite query. */
export type TNearbyDistributorsParams = Omit<TNearbyQuery, 'page' | 'limit'>;

/** One page request. */
export type TNearbyDistributorsPageParams = TNearbyDistributorsParams & Pick<TNearbyQuery, 'page' | 'limit'>;

/** All loaded pages merged — the one result map (5) and list (7) read. */
export type TNearbyDistributorsView = Pick<TNearbyDistributorsResponse, 'scope' | 'source' | 'total'> & {
  items: TNearbyDistributor[];
};
