import { useAppMutation } from '@/shared/lib/query';
import { register } from '../services/auth.service';
import type { TRegisterInput } from '../types/auth.types';

/** Guest action, no cached query depends on the new user → nothing to invalidate. */
export const useRegister = () =>
  useAppMutation({
    mutationFn: (input: TRegisterInput) => register(input),
    // The form shows the error itself (field / root) → no global toast.
    meta: { silent: true },
    invalidates: () => [],
  });
