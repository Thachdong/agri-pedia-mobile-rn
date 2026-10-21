import { appQueryOptions, queryKeys } from '@/shared/lib/query';
import { getCrops } from '../services/knowledge.service';

/** Crops change only when admins enable one — keep them a while. `silent`: the panel shows errors inline. */
const CROPS_STALE_MS = 30 * 60_000;

export const cropsQuery = () =>
  appQueryOptions({
    queryKey: queryKeys.knowledge.crops(),
    queryFn: ({ signal }) => getCrops(signal),
    select: (data) => data.crops,
    staleTime: CROPS_STALE_MS,
    meta: { silent: true },
  });
