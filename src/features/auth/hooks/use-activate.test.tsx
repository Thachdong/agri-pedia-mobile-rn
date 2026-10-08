import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppError } from '@/shared/lib/http';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { activate } from '../services/auth.service';
import { useActivate } from './use-activate';

jest.mock('../services/auth.service');

const INPUT = { identifier: 'a@b.co', code: '123456' };

describe('useActivate', () => {
  beforeEach(() => jest.mocked(activate).mockReset());

  it('sends the input and invalidates nothing', async () => {
    jest.mocked(activate).mockResolvedValue(undefined);
    const client = createTestQueryClient();
    const invalidate = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useActivate(), { wrapper: hookWrapper(client) });

    await act(async () => {
      await result.current.mutateAsync(INPUT);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(activate).toHaveBeenCalledWith(INPUT);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('exposes the AppError code', async () => {
    jest.mocked(activate).mockRejectedValue(new AppError({ status: 400, code: 'OTP_INVALID_CODE', message: 'x' }));
    const { result } = await renderHook(() => useActivate(), { wrapper: hookWrapper() });

    await act(async () => {
      await result.current.mutateAsync(INPUT).catch(() => undefined);
    });

    await waitFor(() => expect(result.current.error?.code).toBe('OTP_INVALID_CODE'));
  });
});
