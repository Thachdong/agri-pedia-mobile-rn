import { http } from '@/shared/lib/http';
import { activate, confirmPasswordReset, login, requestPasswordReset, resendCode } from './auth.service';

jest.mock('@/shared/lib/http', () => ({ http: { post: jest.fn() } }));

describe('auth.service (activate)', () => {
  beforeEach(() => jest.mocked(http.post).mockReset().mockResolvedValue(undefined));

  it('POST /auth/activate with identifier + code', async () => {
    await activate({ identifier: '0901234567', code: '123456' });
    expect(http.post).toHaveBeenCalledWith('/auth/activate', { identifier: '0901234567', code: '123456' });
  });

  it('POST /auth/resend with identifier + purpose', async () => {
    await resendCode({ identifier: 'a@b.co', purpose: 'ACTIVATE_DISTRIBUTOR' });
    expect(http.post).toHaveBeenCalledWith('/auth/resend', { identifier: 'a@b.co', purpose: 'ACTIVATE_DISTRIBUTOR' });
  });
});

describe('auth.service (reset-password)', () => {
  beforeEach(() => jest.mocked(http.post).mockReset().mockResolvedValue(undefined));

  it('POST /auth/reset-password with loginType + identifier', async () => {
    await requestPasswordReset({ loginType: 'PHONE', identifier: '0901234567' });
    expect(http.post).toHaveBeenCalledWith('/auth/reset-password', { loginType: 'PHONE', identifier: '0901234567' });
  });
});

describe('auth.service (change-password)', () => {
  beforeEach(() => jest.mocked(http.post).mockReset().mockResolvedValue(undefined));

  it('POST /auth/reset-password/confirm with identifier + code + newPassword', async () => {
    const input = { identifier: 'a@b.co', code: '123456', newPassword: '12345678' };
    await confirmPasswordReset(input);
    expect(http.post).toHaveBeenCalledWith('/auth/reset-password/confirm', input);
  });
});

describe('auth.service (login)', () => {
  beforeEach(() => jest.mocked(http.post).mockReset());

  it('POST /auth/login with loginType + identifier + password, returns the response', async () => {
    const response = { accessToken: 'a', refreshToken: 'r', user: { id: 'u1' } };
    jest.mocked(http.post).mockResolvedValue(response);
    const input = { loginType: 'EMAIL' as const, identifier: 'a@b.co', password: 'x' };

    await expect(login(input)).resolves.toBe(response);
    expect(http.post).toHaveBeenCalledWith('/auth/login', input);
  });
});
