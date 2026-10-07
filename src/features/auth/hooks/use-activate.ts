import { useAppMutation } from '@/shared/lib/query';
import { activate } from '../services/auth.service';
import type { TActivateInput } from '../types/auth.types';

/** Guest action, no cached query depends on the account status → nothing to invalidate. */
export const useActivate = () =>
  useAppMutation({
    mutationFn: (input: TActivateInput) => activate(input),
    // The form shows the error itself (field / root) → no global toast.
    meta: { silent: true },
    invalidates: () => [],
  });
