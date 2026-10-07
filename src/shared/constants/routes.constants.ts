/**
 * Route paths (Expo Router, files in src/app). Navigate with these, never inline path strings.
 * Public per spec: home, profile, auth/*. Private screens live under src/app/(private)/ (group not in the URL).
 */
export const ROUTES = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  activate: '/auth/activate',
  resetPassword: '/auth/reset-password',
  changePassword: '/auth/change-password',
  profile: (id: string) => `/profile/${id}` as const,
} as const;
