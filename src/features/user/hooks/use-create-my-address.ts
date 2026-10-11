import { queryKeys, useAppMutation } from '@/shared/lib/query';
import { createMyAddress } from '../services/user.service';
import type { TCreateAddressInput } from '../types/user.types';
import { primaryAddressKeys } from './primary-address-keys';

/**
 * Add an address for the logged-in user. A primary one makes the profile stale too.
 * `silent`: the add sheet shows errors under its form.
 * @param userId the logged-in user.
 */
export const useCreateMyAddress = (userId: string) =>
  useAppMutation({
    mutationFn: (input: TCreateAddressInput) => createMyAddress(input),
    invalidates: (input) => (input.isPrimary ? primaryAddressKeys(userId) : [queryKeys.users.addresses()]),
    meta: { silent: true },
  });
