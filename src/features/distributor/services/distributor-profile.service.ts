import { http } from '@/shared/lib/http';
import type { TDistributorProfile } from '../types/distributor.types';

/** Public. Unknown id, not a DISTRIBUTOR, or not ACTIVE → 404 USER_DISTRIBUTOR_NOT_FOUND. */
export const getDistributorProfile = (distributorId: string, signal?: AbortSignal) =>
  http.get<TDistributorProfile>(`/distributors/${encodeURIComponent(distributorId)}`, { signal });
