import { useAppMutation } from '@/shared/lib/query';
import { resendCode } from '../services/auth.service';
import type { TOtpPurpose, TResendCodeInput } from '../types/auth.types';

/**
 * `purpose` fixed by the screen (activate → ACTIVATE_DISTRIBUTOR, change-password → RESET_PASSWORD).
 * Resending a code makes no cached query stale → nothing to invalidate.
 */
export const useResendCode = (purpose: TOtpPurpose) =>
  useAppMutation({
    mutationFn: ({ identifier }: Pick<TResendCodeInput, 'identifier'>) => resendCode({ identifier, purpose }),
    // The form shows the error itself (field / root) → no global toast.
    meta: { silent: true },
    invalidates: () => [],
  });
