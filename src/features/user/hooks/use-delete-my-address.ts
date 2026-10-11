import { queryKeys, useAppMutation } from '@/shared/lib/query';
import { deleteMyAddress } from '../services/user.service';

/** Delete one address (by id) of the logged-in user — never the primary, so the profile is unchanged. */
export const useDeleteMyAddress = () =>
  useAppMutation({
    mutationFn: (addressId: string) => deleteMyAddress(addressId),
    invalidates: () => [queryKeys.users.addresses()],
    meta: { silent: true },
  });
