import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppError } from '@/shared/lib/http';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { confirmPasswordReset } from '../services/auth.service';
import { useConfirmPasswordReset } from './use-confirm-password-reset';

jest.mock('../services/auth.service');

const INPUT = { identifier: 'a@b.co', code: '123456', newPassword: '12345678' };

describe('useConfirmPasswordReset', () => {
  beforeEach(() => jest.mocked(confirmPasswordReset).mockReset());

  it('sends the input and invalidates nothing', async () => {
    jest.mocked(confirmPasswordReset).mockResolvedValue(undefined);
    const client = createTestQueryClient();
    const invalidate = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useConfirmPasswordReset(), { wrapper: hookWrapper(client) });

    await act(async () => {
      await result.current.mutateAsync(INPUT);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(confirmPasswordReset).toHaveBeenCalledWith(INPUT);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('exposes the AppError code', async () => {
    jest
      .mocked(confirmPasswordReset)
      .mockRejectedValue(new AppError({ status: 422, code: 'OTP_EXPIRED', message: 'x' }));
    const { result } = await renderHook(() => useConfirmPasswordReset(), { wrapper: hookWrapper() });

    await act(async () => {
      await result.current.mutateAsync(INPUT).catch(() => undefined);
    });

    await waitFor(() => expect(result.current.error?.code).toBe('OTP_EXPIRED'));
  });
});
