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
