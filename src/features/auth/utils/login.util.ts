import { ROUTES } from '@/shared/constants';
import type { TCurrentUser } from '../types/session.types';

/** Auth screens: going back to one after login would bounce through the guest-only guard. */
const BLOCKED_PREFIXES = ['/auth'] as const;

/**
 * Guards the `from` param against unsafe targets: only an internal path ("/..."); rejects "//host", "\", control
 * characters and auth screens. Invalid → `fallback`. No URL parsing (Hermes URL support is partial) — string rules only.
 */
export const getSafeFromPath = (value: unknown, fallback: string = ROUTES.home): string => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;

  const pathname = value.split(/[?#]/)[0] ?? value;
  if (BLOCKED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return fallback;

  return value;
};

/**
 * Target after login: a safe `from` wins (back to the private screen that sent the guest to login); otherwise by role —
 * DISTRIBUTOR → own profile, FARMER → home. Same rule as web and Flutter.
 */
export const getPostLoginPath = (user: Pick<TCurrentUser, 'id' | 'role'>, from?: unknown): string =>
  getSafeFromPath(from, user.role === 'DISTRIBUTOR' ? ROUTES.profile(user.id) : ROUTES.home);
