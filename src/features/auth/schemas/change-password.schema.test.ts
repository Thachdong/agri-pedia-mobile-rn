import type { TChangePasswordFormValues } from '../types/auth.types';
import { changePasswordSchema } from './change-password.schema';

const VALID: TChangePasswordFormValues = {
  loginType: 'EMAIL',
  identifier: 'nongdan@example.com',
  newPassword: '12345678',
  confirmPassword: '12345678',
  code: '123456',
};

const errorsOf = (overrides: Partial<TChangePasswordFormValues>) =>
  Object.fromEntries(
    (changePasswordSchema.validate({ ...VALID, ...overrides }, { abortEarly: false }).error?.details ?? []).map((d) => [
      d.path.join('.'),
      d.message,
    ]),
  );

describe('changePasswordSchema', () => {
  it('accepts valid values and trims the identifier', () => {
    const { value, error } = changePasswordSchema.validate({ ...VALID, identifier: ' nongdan@example.com ' });
    expect(error).toBeUndefined();
    expect(value?.identifier).toBe('nongdan@example.com');
  });

  it('PHONE: accepts a VN phone and strips separators', () => {
    const { value, error } = changePasswordSchema.validate({ ...VALID, loginType: 'PHONE', identifier: '+84 90 123 4567' });
    expect(error).toBeUndefined();
    expect(value?.identifier).toBe('+84901234567');
  });

  it('identifier rule follows loginType', () => {
    expect(errorsOf({ identifier: 'abc' })).toEqual({ identifier: 'Email không hợp lệ' });
    expect(errorsOf({ loginType: 'PHONE', identifier: 'a@b.co' })).toEqual({ identifier: 'Số điện thoại không hợp lệ' });
  });

  it('newPassword 8..128', () => {
    const at = (n: number) => 'a'.repeat(n);
    expect(Object.keys(errorsOf({ newPassword: at(7), confirmPassword: at(7) }))).toEqual(['newPassword']);
    expect(errorsOf({ newPassword: at(8), confirmPassword: at(8) })).toEqual({});
    expect(errorsOf({ newPassword: at(128), confirmPassword: at(128) })).toEqual({});
    expect(Object.keys(errorsOf({ newPassword: at(129), confirmPassword: at(129) }))).toEqual(['newPassword']);
  });

  it('confirmPassword must match', () => {
    expect(errorsOf({ confirmPassword: '87654321' })).toEqual({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
  });

  it('code: exactly 6 digits', () => {
    expect(errorsOf({ code: '' })).toEqual({ code: 'Vui lòng nhập đủ 6 chữ số' });
    expect(errorsOf({ code: '12345' })).toEqual({ code: 'Mã gồm 6 chữ số' });
    expect(errorsOf({ code: '12345a' })).toEqual({ code: 'Mã gồm 6 chữ số' });
  });
});
