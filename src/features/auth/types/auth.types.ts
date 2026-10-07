import type { TApiSchema } from '@/shared/lib/http';

export type TRegisterInput = TApiSchema<'RegisterUserDto'>;
export type TRegisterAddressInput = TApiSchema<'RegisterAddressDto'>;
export type TActivateInput = TApiSchema<'ActivateAccountDto'>;
export type TResendCodeInput = TApiSchema<'ResendCodeDto'>;
export type TRequestPasswordResetInput = TApiSchema<'RequestPasswordResetDto'>;
export type TConfirmPasswordResetInput = TApiSchema<'ConfirmPasswordResetDto'>;
export type TLoginInput = TApiSchema<'LoginUserDto'>;
export type TLoginType = TRegisterInput['loginType'];
export type TUserRole = TRegisterInput['role'];
export type { TBusinessType } from '@/shared/types';

/** Register form values — adds `confirmPassword` (client only, never sent). */
export type TRegisterFormValues = TRegisterInput & { confirmPassword: string };

/** Activate form values — adds `loginType` (client only: picks the identifier rule + keyboard, never sent). */
export type TActivateFormValues = TActivateInput & { loginType: TLoginType };

/** Reset-password form values — same shape as the request (loginType is sent: the server matches it). */
export type TResetPasswordFormValues = TRequestPasswordResetInput;

/** Change-password form values — adds `loginType` (picks the identifier rule) and `confirmPassword`; both client only. */
export type TChangePasswordFormValues = TConfirmPasswordResetInput & { loginType: TLoginType; confirmPassword: string };

/** Login form values — same shape as the request (loginType is sent: the server matches it). */
export type TLoginFormValues = TLoginInput;

/** Code purpose: ACTIVATE_DISTRIBUTOR (sent at register) | RESET_PASSWORD. */
export type TOtpPurpose = TResendCodeInput['purpose'];

/**
 * Data passed from register → activate and reset-password → change-password (shared decision 1), never via route params.
 * `at` = ISO time the code was sent — the 3-min resend countdown starts from it.
 */
export type TAuthHandoff = {
  loginType: TLoginType;
  identifier: string;
  at: string;
  purpose: TOtpPurpose;
};

/** Pre-fill of the login form, saved by the flows that end on /auth/login (register FARMER, activate, change-password). */
export type TLoginHandoff = Pick<TAuthHandoff, 'loginType' | 'identifier'>;
