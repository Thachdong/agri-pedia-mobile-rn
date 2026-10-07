import { act, renderHook, waitFor } from '@testing-library/react-native';
import { tokenStore } from '@/shared/lib/auth';
import { hookWrapper } from '@/test-utils';
import { getCurrentUser } from '../services/session.service';
import type { TCurrentUser } from '../types/session.types';
import { usePrivateGuard } from './use-private-guard';

jest.mock('../services/session.service');

const USER = { id: 'u1', username: 'A', role: 'FARMER' } as TCurrentUser;
const PAIR = { accessToken: 'a', refreshToken: 'r' };

async function loggedInGuard() {
  await tokenStore.set(PAIR);
  jest.mocked(getCurrentUser).mockResolvedValue(USER);
  const hook = await renderHook(() => usePrivateGuard(), { wrapper: hookWrapper() });
  await waitFor(() => expect(hook.result.current).toBe('allow'));
  return hook;
}

describe('usePrivateGuard', () => {
  beforeEach(async () => {
    await tokenStore.clear();
  });

  it('sends a guest to login', async () => {
    const { result } = await renderHook(() => usePrivateGuard(), { wrapper: hookWrapper() });
    expect(result.current).toBe('login');
  });

  it('allows a logged-in user', async () => {
    await loggedInGuard();
  });

  // Regression (foundation CP8): logout from a private screen raced the guard's redirect to login.
  it('waits (no login redirect) when the user logs out while the screen is open', async () => {
    const { result } = await loggedInGuard();

    await act(() => tokenStore.clear('logout'));

    expect(result.current).toBe('wait');
  });

  it('sends to login when the session expires while the screen is open', async () => {
    const { result } = await loggedInGuard();

    await act(() => tokenStore.clear('expired'));

    expect(result.current).toBe('login');
  });

  it('sends to login a guard opened after a logout (e.g. deep link as guest)', async () => {
    await tokenStore.set(PAIR);
    await tokenStore.clear('logout');

    const { result } = await renderHook(() => usePrivateGuard(), { wrapper: hookWrapper() });

    expect(result.current).toBe('login');
  });
});
