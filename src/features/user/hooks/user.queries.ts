import { appQueryOptions, queryKeys } from '@/shared/lib/query';
import { getMyAddresses } from '../services/user.service';

/** Addresses of the logged-in user — only for a session (private screen). `silent`: the section shows errors inline. */
export const myAddressesQuery = () =>
  appQueryOptions({
    queryKey: queryKeys.users.addresses(),
    queryFn: ({ signal }) => getMyAddresses(signal),
    staleTime: 5 * 60_000,
    meta: { silent: true },
  });
