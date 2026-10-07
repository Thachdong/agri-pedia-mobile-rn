import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import { ROUTES } from '@/shared/constants';
import { AppError, getErrorMessage } from '@/shared/lib/http';
import { renderWithProviders } from '@/test-utils';
import { requestPasswordReset } from '../services/auth.service';
import { authHandoffStore } from '../utils/auth-handoff.store';
import { ResetPasswordForm } from './reset-password-form';

const mockRouter = { replace: jest.fn(), push: jest.fn(), back: jest.fn() };
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  Link: ({ children }: { children: unknown }) => children,
}));
jest.mock('../services/auth.service');

const submit = () => fireEvent.press(screen.getByRole('button', { name: 'RESET' }));

async function renderAndType(identifier: string, loginType: 'EMAIL' | 'PHONE' = 'EMAIL') {
  await renderWithProviders(<ResetPasswordForm />);
  if (loginType === 'PHONE') await fireEvent.press(screen.getByRole('tab', { name: 'PHONE' }));
  await fireEvent.changeText(screen.getByLabelText(loginType === 'PHONE' ? 'Số điện thoại' : 'Email'), identifier);
}

describe('ResetPasswordForm', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('init: EMAIL tab, empty identifier, identifier focused', async () => {
    const focus = jest.spyOn(TextInput.prototype, 'focus');
    await renderWithProviders(<ResetPasswordForm />);

    await waitFor(() => expect(focus).toHaveBeenCalledTimes(1));

    expect(screen.getByRole('tab', { name: 'EMAIL' })).toBeSelected();
    expect(screen.getByLabelText('Email')).toHaveDisplayValue('');
    focus.mockRestore();
  });

  it('switching tab clears identifier and its error, swaps the field', async () => {
    await renderAndType('abc');
    await submit();
    expect(await screen.findByText('Email không hợp lệ')).toBeTruthy();

    await fireEvent.press(screen.getByRole('tab', { name: 'PHONE' }));

    expect(screen.getByLabelText('Số điện thoại')).toHaveDisplayValue('');
    expect(screen.queryByText('Email không hợp lệ')).toBeNull();
  });

  it('invalid identifier → field error, no request', async () => {
    await renderAndType('0901', 'PHONE');

    await submit();

    expect(await screen.findByText('Số điện thoại không hợp lệ')).toBeTruthy();
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it('success → normalized identifier sent, RESET_PASSWORD handoff saved, push /auth/change-password', async () => {
    jest.mocked(requestPasswordReset).mockResolvedValue(undefined);
    const before = Date.now();
    await renderAndType('090 123.4567', 'PHONE');

    await submit();

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.changePassword));
    expect(requestPasswordReset).toHaveBeenCalledWith({ loginType: 'PHONE', identifier: '0901234567' });
    const handoff = await authHandoffStore.read('RESET_PASSWORD');
    expect(handoff).toEqual({ loginType: 'PHONE', identifier: '0901234567', at: expect.any(String), purpose: 'RESET_PASSWORD' });
    expect(Date.parse(handoff!.at)).toBeGreaterThanOrEqual(before);
  });

  it('OTP_ALREADY_REQUESTED → handoff at = issuedAt, still goes to /auth/change-password, no error', async () => {
    const issuedAt = '2026-10-07T03:00:00.000Z';
    jest
      .mocked(requestPasswordReset)
      .mockRejectedValue(new AppError({ status: 409, code: 'OTP_ALREADY_REQUESTED', message: 'x', details: { issuedAt } }));
    await renderAndType('nongdan@example.com');

    await submit();

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.changePassword));
    expect(await authHandoffStore.read('RESET_PASSWORD')).toEqual({
      loginType: 'EMAIL',
      identifier: 'nongdan@example.com',
      at: issuedAt,
      purpose: 'RESET_PASSWORD',
    });
    expect(screen.queryByText(getErrorMessage(new AppError({ status: 409, code: 'OTP_ALREADY_REQUESTED', message: 'x' })))).toBeNull();
  });

  describe('errors (no redirect, no handoff)', () => {
    const expectStayed = async () => {
      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(await authHandoffStore.read('RESET_PASSWORD')).toBeNull();
    };

    it('OTP_ACCOUNT_NOT_FOUND → under identifier', async () => {
      jest
        .mocked(requestPasswordReset)
        .mockRejectedValue(new AppError({ status: 404, code: 'OTP_ACCOUNT_NOT_FOUND', message: 'x' }));
      await renderAndType('nongdan@example.com');

      await submit();

      expect(await screen.findByText('Không tìm thấy tài khoản với email/số điện thoại này')).toBeTruthy();
      expect(screen.queryByRole('link', { name: 'Kích hoạt' })).toBeNull();
      await expectStayed();
    });

    it('OTP_ACCOUNT_NOT_ACTIVE → under the form + activate link', async () => {
      const error = new AppError({ status: 403, code: 'OTP_ACCOUNT_NOT_ACTIVE', message: 'x' });
      jest.mocked(requestPasswordReset).mockRejectedValue(error);
      await renderAndType('npp@example.com');

      await submit();

      expect(await screen.findByText(getErrorMessage(error))).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Kích hoạt' })).toBeTruthy();
      await expectStayed();
    });

    it('OTP_BLOCKED with blockUntil → under the form, no link', async () => {
      const error = new AppError({
        status: 422,
        code: 'OTP_BLOCKED',
        message: 'x',
        details: { blockUntil: '2026-10-07T04:00:00.000Z' },
      });
      jest.mocked(requestPasswordReset).mockRejectedValue(error);
      await renderAndType('nongdan@example.com');

      await submit();

      expect(await screen.findByText(getErrorMessage(error))).toBeTruthy();
      expect(screen.queryByRole('link', { name: 'Kích hoạt' })).toBeNull();
      await expectStayed();
    });
  });

  it('button disabled while the request is pending', async () => {
    jest.mocked(requestPasswordReset).mockReturnValue(new Promise(() => undefined));
    await renderAndType('nongdan@example.com');

    await submit();

    await waitFor(() => expect(screen.getByRole('button', { name: 'RESET' })).toBeDisabled());
    expect(requestPasswordReset).toHaveBeenCalledTimes(1);
  });
});
