import { schema, v } from '@/shared/lib/validation';
import { LOGIN_TYPES } from '../constants/auth.constants';
import type { TResetPasswordFormValues } from '../types/auth.types';
import { identifierField } from './identifier.schema';

/** Mirrors RequestPasswordResetDto (identifier ≤ 255) — client stricter: identifier format per loginType. Same as web. */
export const resetPasswordSchema = schema<TResetPasswordFormValues>({
  loginType: v.string().valid(...LOGIN_TYPES).required(),
  identifier: identifierField(),
});
