import { rules, schema, v } from '@/shared/lib/validation';
import { LOGIN_TYPES, OTP_CODE_LENGTH } from '../constants/auth.constants';
import type { TActivateFormValues } from '../types/auth.types';

/** Mirrors ActivateAccountDto (identifier ≤ 255, code 4..10 digits) — client stricter: exactly OTP_CODE_LENGTH digits. Same as web. */
export const activateSchema = schema<TActivateFormValues>({
  loginType: v.string().valid(...LOGIN_TYPES).required(),
  identifier: v.when('loginType', {
    is: 'PHONE',
    then: rules.phone().required(),
    otherwise: rules.email().required(),
  }),
  code: rules.otpCode(OTP_CODE_LENGTH).required(),
});
