import { registerValues } from '../test/auth.fixtures';
import type { TRegisterFormValues } from '../types/auth.types';
import { registerSchema } from './register.schema';

const validate = (overrides: Partial<TRegisterFormValues> | Record<string, unknown>) =>
  registerSchema.validate({ ...registerValues(), ...overrides });

const errorsOf = (overrides: Partial<TRegisterFormValues> | Record<string, unknown>) =>
  Object.fromEntries((validate(overrides).error?.details ?? []).map((d) => [d.path.join('.'), d.message]));

describe('registerSchema', () => {
  it('accepts a valid FARMER and drops empty optional fields', () => {
    const { value, error } = validate({});
    expect(error).toBeUndefined();
    expect(value).not.toHaveProperty('username');
    expect(value).not.toHaveProperty('bio');
    expect(value?.bussinessType).toBeNull();
  });

  describe('identifier by loginType', () => {
    it('EMAIL: rejects an invalid email', () => {
      expect(errorsOf({ identifier: 'abc' })).toEqual({ identifier: 'Email không hợp lệ' });
    });

    it.each(['+84901234567', '84901234567', '0901234567', '090 123.4567', '(090) 123-4567'])(
      'PHONE: accepts %s and strips separators',
      (identifier) => {
        const { value, error } = validate({ loginType: 'PHONE', identifier });
        expect(error).toBeUndefined();
        expect(value?.identifier).toMatch(/^(\+84|84|0)\d{9}$/);
      },
    );

    it.each(['090123456', '09012345678', '1901234567', 'nongdan@example.com'])('PHONE: rejects %s', (identifier) => {
      expect(errorsOf({ loginType: 'PHONE', identifier })).toEqual({ identifier: 'Số điện thoại không hợp lệ' });
    });
  });

  it.each([
    [7, 'Tối thiểu 8 ký tự'],
    [8, undefined],
    [128, undefined],
    [129, 'Tối đa 128 ký tự'],
  ])('password of %i chars → %s', (length, message) => {
    const password = 'a'.repeat(length);
    expect(errorsOf({ password, confirmPassword: password }).password).toBe(message);
  });

  it('confirmPassword must match password', () => {
    expect(errorsOf({ confirmPassword: '87654321' })).toEqual({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
  });

  it('username 1..100 chars, bio ≤ 1000 chars', () => {
    expect(errorsOf({ username: 'a'.repeat(101), bio: 'a'.repeat(1001) })).toEqual({
      username: 'Tối đa 100 ký tự',
      bio: 'Tối đa 1000 ký tự',
    });
  });

  describe('bussinessType ↔ role', () => {
    it('DISTRIBUTOR requires it', () => {
      expect(errorsOf({ role: 'DISTRIBUTOR', bussinessType: null })).toEqual({
        bussinessType: 'Vui lòng chọn loại hình kinh doanh',
      });
    });

    it('DISTRIBUTOR keeps the chosen type', () => {
      expect(validate({ role: 'DISTRIBUTOR', bussinessType: 'SEEDS_SEEDLINGS' }).value?.bussinessType).toBe(
        'SEEDS_SEEDLINGS',
      );
    });

    it('FARMER always sends null, even when a type was picked before switching role', () => {
      const { value, error } = validate({ role: 'FARMER', bussinessType: 'SEEDS_SEEDLINGS' });
      expect(error).toBeUndefined();
      expect(value?.bussinessType).toBeNull();
    });
  });

  it('address: province, ward, houseNumber and map position are required', () => {
    expect(errorsOf({ address: { province: '', ward: '', houseNumber: ' ' } })).toEqual({
      'address.province': 'Vui lòng chọn tỉnh/thành phố',
      'address.ward': 'Vui lòng chọn phường/xã',
      'address.houseNumber': 'Trường này là bắt buộc',
      'address.lat': 'Vui lòng chọn vị trí trên bản đồ',
      'address.long': 'Vui lòng chọn vị trí trên bản đồ',
    });
  });
});
