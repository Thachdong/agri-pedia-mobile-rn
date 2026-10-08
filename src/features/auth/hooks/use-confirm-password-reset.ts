import { useAppMutation } from '@/shared/lib/query';
import { confirmPasswordReset } from '../services/auth.service';
import type { TConfirmPasswordResetInput } from '../types/auth.types';

/**
 * Guest sets a new password with the reset code → no cached query depends on it, nothing to invalidate.
 * (The server revokes every refresh token; a device still logged in falls back to guest on its next refresh.)
 */
export const useConfirmPasswordReset = () =>
  useAppMutation({
    mutationFn: (input: TConfirmPasswordResetInput) => confirmPasswordReset(input),
    // The form shows the error itself (field / root) → no global toast.
    meta: { silent: true },
    invalidates: () => [],
  });
