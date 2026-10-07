import { env } from '@/shared/config';
import { APP_ERROR_CODE, AppError, isAppError } from '@/shared/lib/http';
import type { TQueryMeta } from './query.types';

type TErrorNotifier = (error: AppError) => void;

const SESSION_EXPIRY_CODES: ReadonlySet<string> = new Set(['AUTH_INVALID_ACCESS_TOKEN', 'USER_INVALID_REFRESH_TOKEN']);

let notifier: TErrorNotifier | null = null;

/** Registers how global errors are shown (toast) — called once in AppProviders. */
export function setQueryErrorNotifier(fn: TErrorNotifier | null): void {
  notifier = fn;
}

export function handleGlobalError(error: unknown, meta?: TQueryMeta): void {
  if (meta?.silent) return;
  const appError = isAppError(error)
    ? error
    : new AppError({ status: 0, code: APP_ERROR_CODE.UNKNOWN_ERROR, message: String(error) });
  // Session expiry is announced once by the auth feature (SessionListener) — not per failed query.
  // Other 401s (e.g. USER_INVALID_CREDENTIALS) are business errors and still toast unless `silent`.
  if (SESSION_EXPIRY_CODES.has(appError.code)) return;
  if (notifier) notifier(appError);
  else if (env.isDev) console.warn('[query]', appError.code, appError.message);
}
