import { http } from '@/shared/lib/http';
import type { TNearbyDistributorsPageParams, TNearbyDistributorsResponse } from '../types/distributor.types';

/** Public; the access token is optional (an invalid one → 401). 400 USER_INVALID_COORDINATES / USER_LOCATION_INVALID. */
export const getNearbyDistributors = (params: TNearbyDistributorsPageParams, signal?: AbortSignal) =>
  http.get<TNearbyDistributorsResponse>('/distributors/nearby', { query: params, signal });
