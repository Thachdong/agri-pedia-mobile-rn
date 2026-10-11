import { queryKeys } from '@/shared/lib/query';

/**
 * Stale when the primary address of `userId` changes: the address list, the session user (`address` = primary),
 * their public distributor profile, and nearby distributor searches (the server centers them on the primary).
 */
export const primaryAddressKeys = (userId: string) => [
  queryKeys.users.addresses(),
  queryKeys.users.me(),
  queryKeys.distributors.detail(userId),
  queryKeys.distributors.nearbyLists(),
];
