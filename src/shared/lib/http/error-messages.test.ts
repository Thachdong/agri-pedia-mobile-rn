import { APP_ERROR_CODE, AppError } from './app-error';
import { getErrorMessage } from './error-messages';

const appError = (status: number, code: string, details?: Record<string, unknown>) =>
  new AppError({ status, code, message: 'server text (English)', details });

describe('getErrorMessage', () => {
  it('uses the Vietnamese text of a known code, never the server message', () => {
    expect(getErrorMessage(appError(401, 'USER_INVALID_CREDENTIALS'))).toBe(
      'Email/số điện thoại hoặc mật khẩu không đúng.',
    );
    expect(getErrorMessage(appError(0, APP_ERROR_CODE.NETWORK_ERROR))).toBe(
      'Không có kết nối mạng. Vui lòng kiểm tra và thử lại.',
    );
  });

  it('falls back to the HTTP status for unknown codes', () => {
    expect(getErrorMessage(appError(403, 'SOMETHING_NEW'))).toBe('Bạn không có quyền thực hiện thao tác này.');
    expect(getErrorMessage(appError(503, 'SOMETHING_NEW'))).toBe('Hệ thống đang bận. Vui lòng thử lại sau.');
  });

  it('uses the generic text for unknown codes with an unmapped status and for non-AppError values', () => {
    expect(getErrorMessage(appError(418, 'SOMETHING_NEW'))).toBe('Đã có lỗi xảy ra. Vui lòng thử lại.');
    expect(getErrorMessage(new Error('boom'))).toBe('Đã có lỗi xảy ra. Vui lòng thử lại.');
    expect(getErrorMessage(undefined)).toBe('Đã có lỗi xảy ra. Vui lòng thử lại.');
  });

  it('shows the unblock time (local HH:mm) for OTP_BLOCKED with details.blockUntil', () => {
    const until = new Date(2026, 9, 7, 9, 5);
    expect(getErrorMessage(appError(429, 'OTP_BLOCKED', { blockUntil: until.toISOString() }))).toBe(
      'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 09:05.',
    );
  });

  it('uses the plain OTP_BLOCKED text when blockUntil is missing or invalid', () => {
    const plain = 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.';
    expect(getErrorMessage(appError(429, 'OTP_BLOCKED'))).toBe(plain);
    expect(getErrorMessage(appError(429, 'OTP_BLOCKED', { blockUntil: 'not-a-date' }))).toBe(plain);
  });
});
