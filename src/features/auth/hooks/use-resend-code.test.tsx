import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppError } from '@/shared/lib/http';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { resendCode } from '../services/auth.service';
import { useResendCode } from './use-resend-code';

jest.mock('../services/auth.service');

describe('useResendCode', () => {
  beforeEach(() => jest.mocked(resendCode).mockReset());

  it.each(['ACTIVATE_DISTRIBUTOR', 'RESET_PASSWORD'] as const)('adds purpose %s and invalidates nothing', async (purpose) => {
    jest.mocked(resendCode).mockResolvedValue(undefined);
    const client = createTestQueryClient();
    const invalidate = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useResendCode(purpose), { wrapper: hookWrapper(client) });

    await act(async () => {
      await result.current.mutateAsync({ identifier: 'a@b.co' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(resendCode).toHaveBeenCalledWith({ identifier: 'a@b.co', purpose });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('exposes OTP_BLOCKED', async () => {
    jest.mocked(resendCode).mockRejectedValue(new AppError({ status: 422, code: 'OTP_BLOCKED', message: 'x' }));
    const { result } = await renderHook(() => useResendCode('ACTIVATE_DISTRIBUTOR'), { wrapper: hookWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ identifier: 'a@b.co' }).catch(() => undefined);
    });

    await waitFor(() => expect(result.current.error?.code).toBe('OTP_BLOCKED'));
  });
});
