import { env } from '@/shared/config';
import { APP_ERROR_CODE, AppError, isAppError } from '@/shared/lib/http';
import type { TQueryMeta } from './query.types';

type TErrorNotifier = (error: AppError) => void;

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
  // 401 after a failed refresh: the session layer moves the user to login, no toast.
  if (appError.status === 401) return;
  if (notifier) notifier(appError);
  else if (env.isDev) console.warn('[query]', appError.code, appError.message);
}
