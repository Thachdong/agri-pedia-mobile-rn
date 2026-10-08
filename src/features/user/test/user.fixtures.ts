import type { TCurrentUser, TSession } from '@/features/auth';

/** GET /users/me body. Override per case (e.g. role DISTRIBUTOR). */
export const currentUser = (overrides: Partial<TCurrentUser> = {}): TCurrentUser => ({
  id: 'u1',
  loginType: 'EMAIL',
  email: 'nongdan@example.com',
  phone: null,
  username: 'Nông dân A',
  role: 'FARMER',
  bussinessType: null,
  bussinessLicense: null,
  avatar: null,
  bio: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  address: null,
  ...overrides,
});

export const guestSession: TSession = { status: 'guest', user: undefined, isLoggedIn: false };
export const loadingSession: TSession = { status: 'loading', user: undefined, isLoggedIn: false };
export const authenticatedSession = (user: Partial<TCurrentUser> = {}): TSession => ({
  status: 'authenticated',
  user: currentUser(user),
  isLoggedIn: true,
});
