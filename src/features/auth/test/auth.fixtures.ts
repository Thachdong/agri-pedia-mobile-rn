import type { TCurrentUser, TLoginResponse } from '../types/session.types';
import type { TRegisterFormValues } from '../types/auth.types';

/** Valid register form values (FARMER, EMAIL). Override per case. */
export const registerValues = (overrides: Partial<TRegisterFormValues> = {}): TRegisterFormValues => ({
  loginType: 'EMAIL',
  identifier: 'nongdan@example.com',
  password: '12345678',
  confirmPassword: '12345678',
  username: '',
  role: 'FARMER',
  bussinessType: null,
  bio: '',
  address: { province: 'ha_noi', ward: 'ba_dinh', houseNumber: '12 Nguyễn Trãi', lat: 21.03, long: 105.85 },
  ...overrides,
});

/** POST /auth/login 200 body. Override the user per case (e.g. role DISTRIBUTOR). */
export const loginResponse = (user: Partial<TCurrentUser> = {}): TLoginResponse => ({
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  user: {
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
    ...user,
  },
});
