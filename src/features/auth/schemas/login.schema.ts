import { schema, v } from '@/shared/lib/validation';
import { LOGIN_TYPES } from '../constants/auth.constants';
import type { TLoginFormValues } from '../types/auth.types';
import { identifierField } from './identifier.schema';

/**
 * Mirrors LoginUserDto (identifier 1..255, password 1..128) — client stricter: identifier format per loginType. Password
 * not trimmed and no strength rule (min 8): older accounts still log in, the server answers USER_INVALID_CREDENTIALS.
 * Same as web.
 */
export const loginSchema = schema<TLoginFormValues>({
  loginType: v.string().valid(...LOGIN_TYPES).required(),
  identifier: identifierField(),
  password: v.string().max(128).required(),
});
