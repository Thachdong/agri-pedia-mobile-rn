import { rules } from './rules';

const errorOf = (result: { error?: { details: { message: string }[] } }) => result.error?.details[0]?.message;

describe('rules.phone', () => {
  it.each([
    ['0912345678', '0912345678'],
    ['84912345678', '84912345678'],
    ['+84912345678', '+84912345678'],
    ['+84 912.345.678', '+84912345678'],
    ['(091) 234-5678', '0912345678'],
  ])('accepts %p and strips separators → %p', (input, expected) => {
    const result = rules.phone().validate(input);
    expect(result.error).toBeUndefined();
    expect(result.value).toBe(expected);
  });

  it.each(['091234567', '09123456789', '1912345678', '+85912345678', 'abc'])('rejects %p', (input) => {
    expect(errorOf(rules.phone().validate(input))).toBe('Số điện thoại không hợp lệ');
  });
});

describe('rules.password', () => {
  it('accepts 8 and 128 characters', () => {
    expect(rules.password().validate('a'.repeat(8)).error).toBeUndefined();
    expect(rules.password().validate('a'.repeat(128)).error).toBeUndefined();
  });

  it('rejects 7 and 129 characters with Vietnamese messages', () => {
    expect(errorOf(rules.password().validate('a'.repeat(7)))).toBe('Tối thiểu 8 ký tự');
    expect(errorOf(rules.password().validate('a'.repeat(129)))).toBe('Tối đa 128 ký tự');
  });
});

describe('rules.email', () => {
  it('trims and accepts a valid email without TLD list', () => {
    const result = rules.email().validate('  user@agripedia.vn ');
    expect(result.error).toBeUndefined();
    expect(result.value).toBe('user@agripedia.vn');
  });

  it('rejects an invalid email', () => {
    expect(errorOf(rules.email().validate('user@'))).toBe('Email không hợp lệ');
  });
});

describe('rules.otpCode', () => {
  it('accepts exactly `length` digits', () => {
    expect(rules.otpCode(6).validate('012345').error).toBeUndefined();
  });

  it.each(['12345', '1234567', '12a456'])('rejects %p', (input) => {
    expect(errorOf(rules.otpCode(6).validate(input))).toBe('Mã gồm 6 chữ số');
  });

  it('asks for the full code when empty', () => {
    expect(errorOf(rules.otpCode(6).validate(''))).toBe('Vui lòng nhập đủ 6 chữ số');
  });
});
