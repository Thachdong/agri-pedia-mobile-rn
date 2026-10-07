import type { TApiSchema } from '@/shared/lib/http';

export type TRegisterInput = TApiSchema<'RegisterUserDto'>;
export type TRegisterAddressInput = TApiSchema<'RegisterAddressDto'>;
export type TActivateInput = TApiSchema<'ActivateAccountDto'>;
export type TResendCodeInput = TApiSchema<'ResendCodeDto'>;
export type TLoginType = TRegisterInput['loginType'];
export type TUserRole = TRegisterInput['role'];
export type { TBusinessType } from '@/shared/types';

/** Register form values — adds `confirmPassword` (client only, never sent). */
export type TRegisterFormValues = TRegisterInput & { confirmPassword: string };

/** Activate form values — adds `loginType` (client only: picks the identifier rule + keyboard, never sent). */
export type TActivateFormValues = TActivateInput & { loginType: TLoginType };

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
