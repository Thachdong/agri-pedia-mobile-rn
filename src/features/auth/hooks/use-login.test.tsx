import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { tokenStore } from '@/shared/lib/auth';
import { AppError } from '@/shared/lib/http';
import { queryKeys } from '@/shared/lib/query';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { login } from '../services/auth.service';
import { loginResponse } from '../test/auth.fixtures';
import { loginHandoffStore } from '../utils/login-handoff.store';
import { useLogin } from './use-login';

jest.mock('../services/auth.service');

const INPUT = { loginType: 'EMAIL' as const, identifier: 'nongdan@example.com', password: 'secret' };

describe('useLogin', () => {
  beforeEach(async () => {
    jest.mocked(login).mockReset();
    await tokenStore.clear();
    await AsyncStorage.clear();
  });

  it('success → tokens saved, current user seeded, login pre-fill cleared', async () => {
    const response = loginResponse();
    jest.mocked(login).mockResolvedValue(response);
    await loginHandoffStore.save({ loginType: 'EMAIL', identifier: 'nongdan@example.com' });
    const client = createTestQueryClient();
    const { result } = await renderHook(() => useLogin(), { wrapper: hookWrapper(client) });

    await act(async () => {
      await result.current.mutateAsync(INPUT);
    });

    expect(login).toHaveBeenCalledWith(INPUT);
    expect(tokenStore.get()).toEqual({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    expect(client.getQueryData(queryKeys.users.me())).toEqual(response.user);
    expect(await loginHandoffStore.read()).toBeNull();
  });

  it('success → invalidates every query except the current user, after the tokens are saved', async () => {
    jest.mocked(login).mockResolvedValue(loginResponse());
    const client = createTestQueryClient();
    client.setQueryData(['distributors', 'search', {}], []);
    let tokenAtInvalidate: unknown = 'not called';
    const invalidate = jest.spyOn(client, 'invalidateQueries').mockImplementation(async () => {
      tokenAtInvalidate = tokenStore.get();
    });
    const { result } = await renderHook(() => useLogin(), { wrapper: hookWrapper(client) });

    await act(async () => {
      await result.current.mutateAsync(INPUT);
    });

    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(tokenAtInvalidate).toEqual({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    const { predicate } = invalidate.mock.calls[0]![0]!;
    const matches = (queryKey: readonly unknown[]) =>
      predicate!({ queryKey } as Parameters<NonNullable<typeof predicate>>[0]);
    expect(matches(queryKeys.users.me())).toBe(false);
    expect(matches(['distributors', 'search', {}])).toBe(true);
  });

  it('error → exposes the AppError code, no session, pre-fill kept', async () => {
    jest.mocked(login).mockRejectedValue(new AppError({ status: 401, code: 'USER_INVALID_CREDENTIALS', message: 'x' }));
    await loginHandoffStore.save({ loginType: 'EMAIL', identifier: 'nongdan@example.com' });
    const { result } = await renderHook(() => useLogin(), { wrapper: hookWrapper() });

    await act(async () => {
      await result.current.mutateAsync(INPUT).catch(() => undefined);
    });

    await waitFor(() => expect(result.current.error?.code).toBe('USER_INVALID_CREDENTIALS'));
    expect(tokenStore.get()).toBeNull();
    expect(await loginHandoffStore.read()).not.toBeNull();
  });
});
