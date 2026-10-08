import { v } from './joi';

/** VN phone: +84 | 84 | 0 + 9 digits; spaces . - ( ) allowed and stripped — matches the API `identifier` (PHONE) rule. */
const VN_PHONE = /^(\+84|84|0)\d{9}$/;
const PHONE_SEPARATORS = /[\s.\-()]/g;

const selectRequired = (message: string) => ({ 'any.required': message, 'string.empty': message });
const LOCATION_REQUIRED = { 'any.required': 'Vui lòng chọn vị trí trên bản đồ' };

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
  /** Required single-choice field (select / radio): missing or '' → `message`. */
  selectRequired,
  /**
   * Fields of one address (address of register / CreateAddressDto) — province / ward are codenames (GET /provinces...),
   * lat / long from the map (not picked yet → missing → "Vui lòng chọn vị trí"). Returns keys to put in an object schema.
   */
  addressFields: () => ({
    province: v.string().max(255).required().messages(selectRequired('Vui lòng chọn tỉnh/thành phố')),
    ward: v.string().max(255).required().messages(selectRequired('Vui lòng chọn phường/xã')),
    houseNumber: v.string().trim().max(255).required(),
    lat: v.number().min(-90).max(90).required().messages(LOCATION_REQUIRED),
    long: v.number().min(-180).max(180).required().messages(LOCATION_REQUIRED),
  }),
  /** OTP code (activate / reset password) — server accepts 4..10 digits, the client locks the configured `length`. */
  otpCode: (length: number) =>
    v
      .string()
      .trim()
      .pattern(new RegExp(`^\\d{${length}}$`))
      .messages({ 'string.pattern.base': `Mã gồm ${length} chữ số`, 'string.empty': `Vui lòng nhập đủ ${length} chữ số` }),
};
