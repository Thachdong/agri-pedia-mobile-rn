import type { TApiSchema } from '@/shared/lib/http';

export type TRegisterInput = TApiSchema<'RegisterUserDto'>;
export type TRegisterAddressInput = TApiSchema<'RegisterAddressDto'>;
export type TLoginType = TRegisterInput['loginType'];
export type TUserRole = TRegisterInput['role'];
export type { TBusinessType } from '@/shared/types';

/** Register form values — adds `confirmPassword` (client only, never sent). */
export type TRegisterFormValues = TRegisterInput & { confirmPassword: string };

/** Code purpose: ACTIVATE_DISTRIBUTOR (sent at register) | RESET_PASSWORD. */
export type TOtpPurpose = TApiSchema<'ResendCodeDto'>['purpose'];

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
