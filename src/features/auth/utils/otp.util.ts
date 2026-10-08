import { isAppError } from '@/shared/lib/http';

/**
 * OTP_ALREADY_REQUESTED (409: the previous code is still valid) is handled as "code sent": returns when that code was
 * issued (`details.issuedAt`, ISO) so the resend countdown starts from it; missing / invalid → `now`.
 * Any other error → null (a real error to show).
 */
export const getIssuedAt = (error: unknown, now: Date = new Date()): string | null => {
  if (!isAppError(error) || error.code !== 'OTP_ALREADY_REQUESTED') return null;
  const raw = error.details && !Array.isArray(error.details) ? error.details.issuedAt : undefined;
  const time = typeof raw === 'string' ? Date.parse(raw) : Number.NaN;
  return new Date(Number.isNaN(time) ? now.getTime() : time).toISOString();
};
