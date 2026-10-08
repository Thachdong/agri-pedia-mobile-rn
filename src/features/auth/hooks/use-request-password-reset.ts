import { useAppMutation } from '@/shared/lib/query';
import { requestPasswordReset } from '../services/auth.service';
import type { TRequestPasswordResetInput } from '../types/auth.types';

/** Guest only sends a code → no cached query becomes stale, nothing to invalidate. */
export const useRequestPasswordReset = () =>
  useAppMutation({
    mutationFn: (input: TRequestPasswordResetInput) => requestPasswordReset(input),
    // The form shows the error itself (field / root) and treats OTP_ALREADY_REQUESTED as success → no global toast.
    meta: { silent: true },
    invalidates: () => [],
  });
