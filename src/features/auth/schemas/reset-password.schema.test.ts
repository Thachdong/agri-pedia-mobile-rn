import type { TResetPasswordFormValues } from '../types/auth.types';
import { resetPasswordSchema } from './reset-password.schema';

const VALID: TResetPasswordFormValues = { loginType: 'EMAIL', identifier: 'nongdan@example.com' };

const errorsOf = (overrides: Partial<TResetPasswordFormValues>) =>
  Object.fromEntries(
    (resetPasswordSchema.validate({ ...VALID, ...overrides }).error?.details ?? []).map((d) => [
      d.path.join('.'),
      d.message,
    ]),
  );

describe('resetPasswordSchema', () => {
  it('EMAIL: accepts and trims', () => {
    const { value, error } = resetPasswordSchema.validate({ ...VALID, identifier: ' nongdan@example.com ' });
    expect(error).toBeUndefined();
    expect(value?.identifier).toBe('nongdan@example.com');
  });

  it('PHONE: accepts a VN phone and strips separators', () => {
    const { value, error } = resetPasswordSchema.validate({ loginType: 'PHONE', identifier: '090 123.4567' });
    expect(error).toBeUndefined();
    expect(value?.identifier).toBe('0901234567');
  });

  it('identifier rule follows loginType', () => {
    expect(errorsOf({ identifier: 'abc' })).toEqual({ identifier: 'Email không hợp lệ' });
    expect(errorsOf({ loginType: 'PHONE', identifier: 'a@b.co' })).toEqual({ identifier: 'Số điện thoại không hợp lệ' });
  });

  it('identifier required', () => {
    expect(Object.keys(errorsOf({ identifier: '' }))).toEqual(['identifier']);
  });

  it('rejects an unknown loginType', () => {
    expect(Object.keys(errorsOf({ loginType: 'SMS' as TResetPasswordFormValues['loginType'] }))).toContain('loginType');
  });
});
