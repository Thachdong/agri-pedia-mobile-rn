import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppError } from '@/shared/lib/http';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { register } from '../services/auth.service';
import { registerValues } from '../test/auth.fixtures';
import { toRegisterInput } from '../utils/register.util';
import { useRegister } from './use-register';

jest.mock('../services/auth.service');

const INPUT = toRegisterInput(registerValues());

describe('useRegister', () => {
  beforeEach(() => jest.mocked(register).mockReset());

  it('sends the input and invalidates nothing', async () => {
    jest.mocked(register).mockResolvedValue(undefined);
    const client = createTestQueryClient();
    const invalidate = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useRegister(), { wrapper: hookWrapper(client) });

    await act(async () => {
      await result.current.mutateAsync(INPUT);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(register).toHaveBeenCalledWith(INPUT);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('exposes the AppError code', async () => {
    jest.mocked(register).mockRejectedValue(new AppError({ status: 409, code: 'USER_IDENTIFIER_ALREADY_USED', message: 'x' }));
    const { result } = await renderHook(() => useRegister(), { wrapper: hookWrapper() });

    await act(async () => {
      await result.current.mutateAsync(INPUT).catch(() => undefined);
    });

    await waitFor(() => expect(result.current.error?.code).toBe('USER_IDENTIFIER_ALREADY_USED'));
  });
});
