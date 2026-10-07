/** Endpoints that must never trigger a token refresh on 401 (their 401 is a business answer, or would loop). */
export const AUTH_PATHS = {
  login: '/auth/login',
  refresh: '/auth/refresh-token',
  logout: '/auth/logout',
} as const;

const NO_REFRESH: readonly string[] = [AUTH_PATHS.login, AUTH_PATHS.refresh, AUTH_PATHS.logout];

export function isNoRefreshPath(path: string): boolean {
  const pathname = path.split('?')[0] ?? path;
  return NO_REFRESH.includes(pathname);
}

/** No Bearer header on these (refresh carries the refresh token in its body; login has no session yet). */
export function isPublicAuthPath(path: string): boolean {
  const pathname = path.split('?')[0] ?? path;
  return pathname === AUTH_PATHS.login || pathname === AUTH_PATHS.refresh;
}
