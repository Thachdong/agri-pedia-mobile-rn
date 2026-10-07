import { act, renderHook, waitFor } from '@testing-library/react-native';
import { tokenStore } from '@/shared/lib/auth';
import { AppError } from '@/shared/lib/http';
import { queryKeys } from '@/shared/lib/query';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { getCurrentUser } from '../services/session.service';
import type { TCurrentUser, TLoginResponse } from '../types/session.types';
import { useSession } from './use-session';
import { useSignIn } from './use-sign-in';

jest.mock('../services/session.service');

const USER: TCurrentUser = {
  id: 'u1',
  loginType: 'PHONE',
  email: null,
  phone: '0912345678',
  username: 'Nông dân A',
  role: 'FARMER',
  bussinessType: null,
  bussinessLicense: null,
  avatar: null,
  bio: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  address: null,
};

describe('useSession', () => {
  beforeEach(async () => {
    await tokenStore.clear();
    jest.mocked(getCurrentUser).mockReset();
  });

  it('is guest without tokens and does not call /users/me', async () => {
    const { result } = await renderHook(() => useSession(), { wrapper: hookWrapper() });

    expect(result.current).toEqual({ status: 'guest', user: undefined, isLoggedIn: false });
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it('is loading, then authenticated with the user, when tokens exist', async () => {
    await tokenStore.set({ accessToken: 'a', refreshToken: 'r' });
    jest.mocked(getCurrentUser).mockResolvedValue(USER);

    const { result } = await renderHook(() => useSession(), { wrapper: hookWrapper() });

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(result.current.user).toEqual(USER);
    expect(result.current.isLoggedIn).toBe(true);
  });

  it('is guest when /users/me fails (same as Flutter)', async () => {
    await tokenStore.set({ accessToken: 'a', refreshToken: 'r' });
    jest.mocked(getCurrentUser).mockRejectedValue(new AppError({ status: 404, code: 'USER_NOT_FOUND', message: 'x' }));

    const { result } = await renderHook(() => useSession(), { wrapper: hookWrapper() });

    await waitFor(() => expect(result.current.status).toBe('guest'));
  });

  it('becomes guest when the tokens are cleared (logout / session expired)', async () => {
    await tokenStore.set({ accessToken: 'a', refreshToken: 'r' });
    jest.mocked(getCurrentUser).mockResolvedValue(USER);
    const { result } = await renderHook(() => useSession(), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    await act(() => tokenStore.clear());

    expect(result.current.status).toBe('guest');
  });

  it('is authenticated right after useSignIn, without another /users/me call', async () => {
    const client = createTestQueryClient();
    const { result } = await renderHook(() => ({ session: useSession(), signIn: useSignIn() }), {
      wrapper: hookWrapper(client),
    });
    const login: TLoginResponse = { accessToken: 'a', refreshToken: 'r', user: USER };

    await act(() => result.current.signIn(login));

    expect(result.current.session).toEqual({ status: 'authenticated', user: USER, isLoggedIn: true });
    expect(client.getQueryData(queryKeys.users.me())).toEqual(USER);
    expect(tokenStore.get()).toEqual({ accessToken: 'a', refreshToken: 'r' });
    expect(getCurrentUser).not.toHaveBeenCalled();
  });
});
