import { AUTH_PATHS } from '@/shared/lib/auth';
import { http } from '@/shared/lib/http';
import type { TCurrentUser } from '../types/session.types';

export const getCurrentUser = () => http.get<TCurrentUser>('/users/me');

/** Revokes the refresh token's session on the server; 200 even when it is already gone. */
export const logout = (refreshToken: string) => http.post<void>(AUTH_PATHS.logout, { refreshToken });
