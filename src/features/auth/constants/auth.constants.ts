import type { TLoginType, TUserRole } from '../types/auth.types';

export const LOGIN_TYPES = ['EMAIL', 'PHONE'] as const satisfies readonly TLoginType[];

/** Tab labels as in the wireframe. */
export const LOGIN_TYPE_OPTIONS = [
  { value: 'EMAIL', label: 'EMAIL' },
  { value: 'PHONE', label: 'PHONE' },
] as const satisfies readonly { value: TLoginType; label: string }[];

export const IDENTIFIER_LABELS: Record<TLoginType, string> = {
  EMAIL: 'Email',
  PHONE: 'Số điện thoại',
};

/** TextInput props of the identifier field per login type (keyboard, autofill, placeholder) — every auth form. */
export const IDENTIFIER_INPUT = {
  EMAIL: {
    keyboardType: 'email-address',
    autoComplete: 'email',
    textContentType: 'emailAddress',
    placeholder: 'ban@example.com',
  },
  PHONE: {
    keyboardType: 'phone-pad',
    autoComplete: 'tel',
    textContentType: 'telephoneNumber',
    placeholder: '0901 234 567',
  },
} as const;

export const ROLE_OPTIONS = [
  { value: 'FARMER', label: 'Nông dân', description: 'Tài khoản dùng được ngay' },
  { value: 'DISTRIBUTOR', label: 'Nhà phân phối', description: 'Cần kích hoạt bằng mã gửi về email/số điện thoại' },
] as const satisfies readonly { value: TUserRole; label: string; description: string }[];

/** Domain errors of POST /auth/register → form field + message shown under it (same text as web). Others → under the form. */
export const REGISTER_ERROR_FIELDS = {
  USER_IDENTIFIER_ALREADY_USED: { field: 'identifier', message: 'Email/số điện thoại này đã được đăng ký' },
  USER_LOCATION_INVALID: { field: 'address.ward', message: 'Phường/xã không thuộc tỉnh/thành đã chọn' },
  USER_INVALID_COORDINATES: { field: 'address.lat', message: 'Vị trí trên bản đồ không hợp lệ' },
  USER_BUSINESS_TYPE_REQUIRED: { field: 'bussinessType', message: 'Vui lòng chọn loại hình kinh doanh' },
  USER_BUSINESS_TYPE_NOT_ALLOWED: { field: 'bussinessType', message: 'Nông dân không chọn loại hình kinh doanh' },
} as const;

/** Matches the server OTP_LENGTH (default 6); the API accepts 4..10 digits. */
export const OTP_CODE_LENGTH = 6;

/** Resend is locked for 3 min after a code is sent (ui-ux.md §2) — counted from the handoff `at`. */
export const RESEND_CODE_COOLDOWN_MS = 3 * 60 * 1000;

/**
 * Domain errors of POST /auth/activate that belong to a field (same text as web). Others (OTP_ALREADY_CONSUMED,
 * OTP_BLOCKED + blockUntil, ...) → under the form via applyServerErrors / getErrorMessage.
 */
export const ACTIVATE_ERROR_FIELDS = {
  OTP_INVALID_CODE: { field: 'code', message: 'Mã kích hoạt không đúng' },
  OTP_EXPIRED: { field: 'code', message: 'Mã đã hết hạn, bấm Gửi lại để nhận mã mới' },
  OTP_NOT_FOUND: { field: 'identifier', message: 'Không tìm thấy mã kích hoạt cho tài khoản này' },
} as const;

/** Errors of POST /auth/activate shown under the form with a "Đăng nhập" link (the account is already active). */
export const ACTIVATE_LOGIN_LINK_ERRORS: readonly string[] = ['OTP_ALREADY_CONSUMED'];

/**
 * Domain errors of POST /auth/reset-password that belong to a field (same text as web). OTP_ALREADY_REQUESTED is not an
 * error (the form goes on to change-password, see getIssuedAt). Others (OTP_BLOCKED + blockUntil, ...) → under the form.
 */
export const RESET_PASSWORD_ERROR_FIELDS = {
  OTP_ACCOUNT_NOT_FOUND: { field: 'identifier', message: 'Không tìm thấy tài khoản với email/số điện thoại này' },
} as const;

/** Errors of POST /auth/reset-password shown under the form with a "Kích hoạt" link (account still PENDING). */
export const RESET_PASSWORD_ACTIVATE_LINK_ERRORS: readonly string[] = ['OTP_ACCOUNT_NOT_ACTIVE'];
