import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppError } from '@/shared/lib/http';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { requestPasswordReset } from '../services/auth.service';
import { useRequestPasswordReset } from './use-request-password-reset';

jest.mock('../services/auth.service');

describe('useRequestPasswordReset', () => {
  beforeEach(() => jest.mocked(requestPasswordReset).mockReset());

  it('sends the input and invalidates nothing', async () => {
    jest.mocked(requestPasswordReset).mockResolvedValue(undefined);
    const client = createTestQueryClient();
    const invalidate = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useRequestPasswordReset(), { wrapper: hookWrapper(client) });

    await act(async () => {
      await result.current.mutateAsync({ loginType: 'EMAIL', identifier: 'a@b.co' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestPasswordReset).toHaveBeenCalledWith({ loginType: 'EMAIL', identifier: 'a@b.co' });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('exposes OTP_ALREADY_REQUESTED with its details', async () => {
    const issuedAt = '2026-10-07T03:00:00.000Z';
    jest
      .mocked(requestPasswordReset)
      .mockRejectedValue(new AppError({ status: 409, code: 'OTP_ALREADY_REQUESTED', message: 'x', details: { issuedAt } }));
    const { result } = await renderHook(() => useRequestPasswordReset(), { wrapper: hookWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ loginType: 'EMAIL', identifier: 'a@b.co' }).catch(() => undefined);
    });

    await waitFor(() => expect(result.current.error?.code).toBe('OTP_ALREADY_REQUESTED'));
    expect(result.current.error?.details).toEqual({ issuedAt });
  });
});
