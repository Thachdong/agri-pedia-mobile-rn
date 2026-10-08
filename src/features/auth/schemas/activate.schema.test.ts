import type { TActivateFormValues } from '../types/auth.types';
import { activateSchema } from './activate.schema';

const VALID: TActivateFormValues = { loginType: 'EMAIL', identifier: 'nhaphanphoi@example.com', code: '123456' };

const errorsOf = (overrides: Partial<TActivateFormValues>) =>
  Object.fromEntries(
    (activateSchema.validate({ ...VALID, ...overrides }).error?.details ?? []).map((d) => [d.path.join('.'), d.message]),
  );

describe('activateSchema', () => {
  it('accepts a valid EMAIL form', () => {
    expect(activateSchema.validate(VALID).error).toBeUndefined();
  });

  it('PHONE: accepts a VN phone and strips separators', () => {
    const { value, error } = activateSchema.validate({ ...VALID, loginType: 'PHONE', identifier: '090 123.4567' });
    expect(error).toBeUndefined();
    expect(value?.identifier).toBe('0901234567');
  });

  it('identifier rule follows loginType', () => {
    expect(errorsOf({ identifier: 'abc' })).toEqual({ identifier: 'Email không hợp lệ' });
    expect(errorsOf({ loginType: 'PHONE', identifier: 'a@b.co' })).toEqual({ identifier: 'Số điện thoại không hợp lệ' });
  });

  it.each(['12345', '1234567', '12a456', '12 345'])('code %p → exactly 6 digits', (code) => {
    expect(errorsOf({ code })).toEqual({ code: 'Mã gồm 6 chữ số' });
  });

  it('empty code → asks for all digits', () => {
    expect(errorsOf({ code: '' })).toEqual({ code: 'Vui lòng nhập đủ 6 chữ số' });
  });
});
