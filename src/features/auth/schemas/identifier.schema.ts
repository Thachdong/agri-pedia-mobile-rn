import { rules, v } from '@/shared/lib/validation';
import type { TLoginType } from '../types/auth.types';

/** Identifier rule per login type — every auth form (activate, reset-password, change-password, login). */
export const identifierRule = (loginType: TLoginType) => (loginType === 'PHONE' ? rules.phone() : rules.email());

/** `identifier` field of a schema that also has `loginType` (EMAIL | PHONE). */
export const identifierField = () =>
  v.when('loginType', {
    is: 'PHONE',
    then: identifierRule('PHONE').required(),
    otherwise: identifierRule('EMAIL').required(),
  });

/**
 * Identifier as the schema converts it on submit (trimmed, phone separators stripped) — for requests sent outside
 * `handleSubmit` (resend), so resend / activate / handoff all use the same value. Invalid → trimmed input.
 */
export const toIdentifier = (loginType: TLoginType, identifier: string): string => {
  const { value, error } = identifierRule(loginType).validate(identifier);
  return error || typeof value !== 'string' ? identifier.trim() : value;
};
