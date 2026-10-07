import { env } from '@/shared/config';
import { isNoRefreshPath, isPublicAuthPath, refreshTokens, tokenStore } from '@/shared/lib/auth';
import { createHttpClient } from './create-http-client';

/**
 * The app's HTTP client (NestJS API) with the session wired in:
 * Bearer access token on every request; on 401 one single-flight refresh (skipped if the token was already rotated
 * since the request was sent), then one retry with the new token.
 * Refresh rejected → tokens cleared + session-expired event (guard sends private screens to login).
 */
export const http = createHttpClient({
  baseUrl: env.apiUrl,
  getHeaders: (path): Record<string, string> => {
    const accessToken = tokenStore.get()?.accessToken;
    return accessToken && !isPublicAuthPath(path) ? { authorization: `Bearer ${accessToken}` } : {};
  },
  onUnauthorized: async ({ path, requestHeaders }) => {
    const current = tokenStore.get();
    if (isNoRefreshPath(path) || !current) return false;
    // Sent with an access token that has since been rotated (another 401 already refreshed): just retry.
    if (requestHeaders.authorization !== `Bearer ${current.accessToken}`) return true;
    return (await refreshTokens()) !== null;
  },
});
