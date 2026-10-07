import type { TLoginFormValues } from '../types/auth.types';
import { loginSchema } from './login.schema';

const VALID: TLoginFormValues = { loginType: 'EMAIL', identifier: 'nongdan@example.com', password: 'secret' };

const errorKeys = (overrides: Partial<TLoginFormValues>) =>
  (loginSchema.validate({ ...VALID, ...overrides }, { abortEarly: false }).error?.details ?? []).map((d) =>
    d.path.join('.'),
  );

describe('loginSchema', () => {
  it('EMAIL: accepts and trims the identifier', () => {
    const { value, error } = loginSchema.validate({ ...VALID, identifier: ' nongdan@example.com ' });
    expect(error).toBeUndefined();
    expect(value?.identifier).toBe('nongdan@example.com');
  });

  it('PHONE: accepts a VN phone and strips separators', () => {
    const { value, error } = loginSchema.validate({ ...VALID, loginType: 'PHONE', identifier: '090 123.4567' });
    expect(error).toBeUndefined();
    expect(value?.identifier).toBe('0901234567');
  });

  it('identifier rule follows loginType', () => {
    expect(errorKeys({ identifier: 'abc' })).toEqual(['identifier']);
    expect(errorKeys({ loginType: 'PHONE', identifier: 'a@b.co' })).toEqual(['identifier']);
  });

  it('identifier and password required', () => {
    expect(errorKeys({ identifier: '', password: '' })).toEqual(['identifier', 'password']);
  });

  it('password: no strength rule (1 char ok), max 128, not trimmed', () => {
    expect(errorKeys({ password: 'x' })).toEqual([]);
    expect(errorKeys({ password: 'a'.repeat(128) })).toEqual([]);
    expect(errorKeys({ password: 'a'.repeat(129) })).toEqual(['password']);
    expect(loginSchema.validate({ ...VALID, password: ' pass ' }).value?.password).toBe(' pass ');
  });

  it('rejects an unknown loginType', () => {
    expect(errorKeys({ loginType: 'SMS' as TLoginFormValues['loginType'] })).toContain('loginType');
  });
});
