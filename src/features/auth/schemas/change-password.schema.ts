import { rules, schema, v } from '@/shared/lib/validation';
import { LOGIN_TYPES, OTP_CODE_LENGTH } from '../constants/auth.constants';
import type { TChangePasswordFormValues } from '../types/auth.types';
import { identifierField } from './identifier.schema';

/**
 * Mirrors ConfirmPasswordResetDto (identifier ≤ 255, code 4..10 digits, newPassword 8..128) — client stricter: identifier
 * format per loginType, code exactly OTP_CODE_LENGTH digits. `confirmPassword` client only. Same as web.
 */
export const changePasswordSchema = schema<TChangePasswordFormValues>({
  loginType: v.string().valid(...LOGIN_TYPES).required(),
  identifier: identifierField(),
  newPassword: rules.password().required(),
  confirmPassword: v
    .string()
    .valid(v.ref('newPassword'))
    .required()
    .messages({ 'any.only': 'Mật khẩu xác nhận không khớp' }),
  code: rules.otpCode(OTP_CODE_LENGTH).required(),
});
