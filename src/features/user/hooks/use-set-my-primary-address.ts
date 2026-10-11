import { useAppMutation } from '@/shared/lib/query';
import { setMyPrimaryAddress } from '../services/user.service';
import { primaryAddressKeys } from './primary-address-keys';

/**
 * Make one address (by id) the primary of the logged-in user. `silent`: the confirm sheet shows the error.
 * @param userId the logged-in user.
 */
export const useSetMyPrimaryAddress = (userId: string) =>
  useAppMutation({
    mutationFn: (addressId: string) => setMyPrimaryAddress(addressId),
    invalidates: () => primaryAddressKeys(userId),
    meta: { silent: true },
  });
