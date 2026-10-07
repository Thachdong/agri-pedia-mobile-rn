import type { TApiSchema } from '@/shared/lib/http';

/** Profile of the logged-in user (GET /users/me = `user` of POST /auth/login). Spec spelling: `bussinessType`. */
export type TCurrentUser = TApiSchema<'UserProfileResponse'>;

export type TLoginResponse = TApiSchema<'LoginUserResponse'>;

export type TSessionStatus = 'loading' | 'guest' | 'authenticated';

export type TSession =
  | { status: 'loading'; user: undefined; isLoggedIn: false }
  | { status: 'guest'; user: undefined; isLoggedIn: false }
  | { status: 'authenticated'; user: TCurrentUser; isLoggedIn: true };
