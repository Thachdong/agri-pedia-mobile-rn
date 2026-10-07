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
