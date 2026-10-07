import { http } from '@/shared/lib/http';
import type {
  TActivateInput,
  TConfirmPasswordResetInput,
  TRegisterInput,
  TRequestPasswordResetInput,
  TResendCodeInput,
} from '../types/auth.types';

/** 201, empty body. FARMER is ACTIVE at once; DISTRIBUTOR is PENDING and receives an activation code. */
export const register = (input: TRegisterInput) => http.post<void, TRegisterInput>('/auth/register', input);

/** 200, empty body. Wrong / expired / blocked code → OTP_* (400 / 404 / 422); the account becomes ACTIVE on success. */
export const activate = (input: TActivateInput) => http.post<void, TActivateInput>('/auth/activate', input);

/** 200, empty body. Sends the latest code of `purpose` again (or a new one if it expired); too many → OTP_BLOCKED. */
export const resendCode = (input: TResendCodeInput) => http.post<void, TResendCodeInput>('/auth/resend', input);

/**
 * 200, empty body. Sends a RESET_PASSWORD code to an ACTIVE account. Previous code still valid → 409 OTP_ALREADY_REQUESTED
 * (details.issuedAt); blocked → 422 OTP_BLOCKED; unknown / not active → OTP_ACCOUNT_NOT_FOUND / OTP_ACCOUNT_NOT_ACTIVE.
 */
export const requestPasswordReset = (input: TRequestPasswordResetInput) =>
  http.post<void, TRequestPasswordResetInput>('/auth/reset-password', input);

/**
 * 200, empty body. Consumes the latest RESET_PASSWORD code and replaces the password; every session of the user is logged
 * out. Wrong code → 400 OTP_INVALID_CODE; no code → 404 OTP_NOT_FOUND; consumed / expired / blocked → 422 OTP_*.
 */
export const confirmPasswordReset = (input: TConfirmPasswordResetInput) =>
  http.post<void, TConfirmPasswordResetInput>('/auth/reset-password/confirm', input);
