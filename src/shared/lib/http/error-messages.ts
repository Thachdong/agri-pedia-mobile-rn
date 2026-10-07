import { APP_ERROR_CODE, AppError, isAppError } from './app-error';

/**
 * Vietnamese text for an error — under forms, in toasts, in error views. Components never compare codes for display.
 * Lookup: code → HTTP status → generic. Server `message` is developer text (English) and is never shown.
 * Wording is shared with the Flutter app (ui_ux/lib/core/error/error_messages.dart) and the web client — keep identical.
 * Add a feature's codes when connecting its endpoints (rn-feature-api).
 */
export function getErrorMessage(error: unknown): string {
  if (!isAppError(error)) return GENERIC;
  const until = blockedUntil(error);
  if (until) return `Bạn đã thử quá nhiều lần. Vui lòng thử lại sau ${hhmm(until)}.`;
  return MESSAGES[error.code] ?? byStatus(error.status) ?? GENERIC;
}

const GENERIC = 'Đã có lỗi xảy ra. Vui lòng thử lại.';

/** `OTP_BLOCKED` may carry `details.blockUntil` (ISO date), shown in local time. */
function blockedUntil(error: AppError): Date | null {
  if (error.code !== 'OTP_BLOCKED' || !error.details || Array.isArray(error.details)) return null;
  const raw = error.details.blockUntil;
  if (typeof raw !== 'string') return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hhmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function byStatus(status: number): string | null {
  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (status === 404) return 'Không tìm thấy dữ liệu.';
  if (status === 429) return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.';
  if (status >= 500) return 'Hệ thống đang bận. Vui lòng thử lại sau.';
  return null;
}

const MESSAGES: Record<string, string> = {
  // Client
  [APP_ERROR_CODE.NETWORK_ERROR]: 'Không có kết nối mạng. Vui lòng kiểm tra và thử lại.',
  [APP_ERROR_CODE.TIMEOUT]: 'Kết nối quá chậm. Vui lòng thử lại.',
  [APP_ERROR_CODE.VALIDATION_ERROR]: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  // Session
  AUTH_INVALID_ACCESS_TOKEN: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  USER_INVALID_REFRESH_TOKEN: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  // Login
  USER_INVALID_CREDENTIALS: 'Email/số điện thoại hoặc mật khẩu không đúng.',
  USER_NOT_ACTIVE: 'Tài khoản chưa được kích hoạt.',
  // Register
  USER_IDENTIFIER_ALREADY_USED: 'Email/số điện thoại này đã được dùng để đăng ký.',
  USER_INVALID_COORDINATES: 'Toạ độ không hợp lệ. Vui lòng chọn lại vị trí.',
  USER_LOCATION_INVALID: 'Tỉnh/thành phố hoặc phường/xã không hợp lệ. Vui lòng chọn lại.',
  USER_BUSINESS_TYPE_REQUIRED: 'Vui lòng chọn loại hình kinh doanh.',
  USER_BUSINESS_TYPE_NOT_ALLOWED: 'Nông dân không cần chọn loại hình kinh doanh.',
  // OTP (activate, resend, reset-password, change-password)
  OTP_ACCOUNT_NOT_FOUND: 'Không tìm thấy tài khoản với email/số điện thoại này.',
  OTP_ACCOUNT_NOT_ACTIVE: 'Tài khoản chưa được kích hoạt.',
  OTP_ALREADY_REQUESTED: 'Mã xác thực đã được gửi và vẫn còn hiệu lực. Vui lòng kiểm tra lại.',
  OTP_INVALID_CODE: 'Mã xác thực không đúng.',
  OTP_NOT_FOUND: 'Không tìm thấy mã xác thực cho tài khoản này.',
  OTP_ALREADY_CONSUMED: 'Mã xác thực đã được sử dụng.',
  OTP_EXPIRED: 'Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới.',
  OTP_BLOCKED: 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.',
  // Location
  LOCATION_PROVINCE_NOT_FOUND: 'Không tìm thấy tỉnh/thành phố.',
};
