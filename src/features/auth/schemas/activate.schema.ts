import { rules, schema, v } from '@/shared/lib/validation';
import { LOGIN_TYPES, OTP_CODE_LENGTH } from '../constants/auth.constants';
import type { TActivateFormValues, TLoginType } from '../types/auth.types';

const identifierRule = (loginType: TLoginType) => (loginType === 'PHONE' ? rules.phone() : rules.email());

/** Mirrors ActivateAccountDto (identifier ≤ 255, code 4..10 digits) — client stricter: exactly OTP_CODE_LENGTH digits. Same as web. */
export const activateSchema = schema<TActivateFormValues>({
  loginType: v.string().valid(...LOGIN_TYPES).required(),
  identifier: v.when('loginType', {
    is: 'PHONE',
    then: identifierRule('PHONE').required(),
    otherwise: identifierRule('EMAIL').required(),
  }),
  code: rules.otpCode(OTP_CODE_LENGTH).required(),
});

/**
 * Identifier as the schema converts it on submit (trimmed, phone separators stripped) — for requests sent outside
 * `handleSubmit` (resend), so resend / activate / handoff all use the same value. Invalid → trimmed input.
 */
export const toIdentifier = (loginType: TLoginType, identifier: string): string => {
  const { value, error } = identifierRule(loginType).validate(identifier);
  return error || typeof value !== 'string' ? identifier.trim() : value;
};
