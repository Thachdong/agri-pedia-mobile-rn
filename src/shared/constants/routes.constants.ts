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
  /** Own profile of the logged-in user (private; FARMER — a DISTRIBUTOR is redirected to `profile(id)`). */
  myProfile: '/profile/me',
  /** Product detail — a page on mobile (web: dialog M3). */
  product: (id: string) => `/product/${id}` as const,
  notifications: '/notifications',
  chat: '/chat',
  chatRoom: (roomId: string) => `/chat/${roomId}` as const,
  /** Chat with one user (profile Chat): opens the existing room, or a new conversation by `receiverId`. */
  chatWithUser: (userId: string) => `/chat/user/${userId}` as const,
} as const;
