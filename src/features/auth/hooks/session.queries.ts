import { appQueryOptions, queryKeys } from '@/shared/lib/query';
import { getCurrentUser } from '../services/session.service';

/** Current user — `silent`: a failure here means "no usable session", not an error to toast. */
export const currentUserQuery = () =>
  appQueryOptions({
    queryKey: queryKeys.users.me(),
    queryFn: getCurrentUser,
    meta: { silent: true },
  });
