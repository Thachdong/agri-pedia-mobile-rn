import { env } from '@/shared/config';
// Module paths, not '@/shared/lib/http': http/client.ts imports this folder, the index would be a cycle.
import type { TApiSchema } from '@/shared/lib/http/api-types';
import { isAppError } from '@/shared/lib/http/app-error';
import { createHttpClient } from '@/shared/lib/http/create-http-client';
import { AUTH_PATHS } from './auth-paths';
import { emitSessionExpired } from './session-events';
import { tokenStore, type TTokenPair } from './token-store';

type TRefreshResponse = TApiSchema<'RefreshAccessTokenResponse'>;

/** Bare client (no session hooks) so a refresh can never trigger another refresh. */
const refreshClient = createHttpClient({ baseUrl: env.apiUrl });

let inflight: Promise<TTokenPair | null> | null = null;

async function doRefresh(): Promise<TTokenPair | null> {
  const refreshToken = tokenStore.get()?.refreshToken;
  if (!refreshToken) return null;

  try {
    const pair = await refreshClient.post<TRefreshResponse>(AUTH_PATHS.refresh, { refreshToken });
    await tokenStore.set({ accessToken: pair.accessToken, refreshToken: pair.refreshToken });
    return tokenStore.get();
  } catch (error) {
    // Rejected by the server (USER_INVALID_REFRESH_TOKEN, revoked, reused) → session is over.
    // Network / timeout / 5xx → keep the tokens: the user stays logged in and the next request tries again.
    if (isAppError(error) && error.status >= 400 && error.status < 500) {
      await tokenStore.clear();
      emitSessionExpired();
    }
    return null;
  }
}

/**
 * Exchanges the refresh token for a new pair — single-flight: concurrent 401s share one refresh call
 * (the server rotates the token, so two parallel refreshes would revoke each other).
 * Resolves the new pair, or null when there is no session / it could not be refreshed.
 */
export function refreshTokens(): Promise<TTokenPair | null> {
  inflight ??= doRefresh().finally(() => {
    inflight = null;
  });
  return inflight;
}
