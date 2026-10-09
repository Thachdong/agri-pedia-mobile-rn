import { appQueryOptions, queryKeys } from '@/shared/lib/query';
import { getDistributorProfile } from '../services/distributor-profile.service';

/** Signed license URL expires (~1h) → keep it fresh well inside that. `silent`: the profile shows errors inline. */
const PROFILE_STALE_MS = 5 * 60_000;

export const distributorProfileQuery = (distributorId: string) =>
  appQueryOptions({
    queryKey: queryKeys.distributors.detail(distributorId),
    queryFn: ({ signal }) => getDistributorProfile(distributorId, signal),
    staleTime: PROFILE_STALE_MS,
    meta: { silent: true },
  });
