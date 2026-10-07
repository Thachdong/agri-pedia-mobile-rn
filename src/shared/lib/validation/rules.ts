import { v } from './joi';

/** VN phone: +84 | 84 | 0 + 9 digits; spaces . - ( ) allowed and stripped — matches the API `identifier` (PHONE) rule. */
const VN_PHONE = /^(\+84|84|0)\d{9}$/;
const PHONE_SEPARATORS = /[\s.\-()]/g;

/** Shared rules mirroring the NestJS DTO constraints (specs/openapi.json + specs/api.md). Same names as the web client. */
export const rules = {
  id: () => v.string().guid(),
  // joi has no TLD list outside Node → TLD check off (same as web).
  email: () => v.string().trim().max(255).email({ tlds: { allow: false } }),
  phone: () =>
    v
      .string()
      .trim()
      .replace(PHONE_SEPARATORS, '')
      .pattern(VN_PHONE)
      .messages({ 'string.pattern.base': 'Số điện thoại không hợp lệ' }),
  password: () => v.string().min(8).max(128),
  username: () => v.string().trim().min(1).max(100),
  /** OTP code (activate / reset password) — server accepts 4..10 digits, the client locks the configured `length`. */
  otpCode: (length: number) =>
    v
      .string()
      .trim()
      .pattern(new RegExp(`^\\d{${length}}$`))
      .messages({ 'string.pattern.base': `Mã gồm ${length} chữ số`, 'string.empty': `Vui lòng nhập đủ ${length} chữ số` }),
};
