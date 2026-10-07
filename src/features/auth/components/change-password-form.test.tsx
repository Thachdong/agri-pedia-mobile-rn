import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AppError, getErrorMessage } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { renderWithProviders } from '@/test-utils';
import { confirmPasswordReset, resendCode } from '../services/auth.service';
import type { TAuthHandoff } from '../types/auth.types';
import { authHandoffStore } from '../utils/auth-handoff.store';
import { ChangePasswordForm } from './change-password-form';

const mockRouter = { replace: jest.fn(), push: jest.fn(), back: jest.fn() };
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  Link: ({ children }: { children: unknown }) => children,
}));
jest.mock('@/shared/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('../services/auth.service');

const COUNTDOWN = /^0[0-3]:\d\d$/;
const SUBMIT = 'CHANGE PASSWORD';

const handoff = (overrides: Partial<TAuthHandoff> = {}): TAuthHandoff => ({
  loginType: 'PHONE',
  identifier: '0901234567',
  at: new Date().toISOString(),
  purpose: 'RESET_PASSWORD',
  ...overrides,
});

const resendButton = () => screen.getByRole('button', { name: 'Gửi lại' });

async function renderWithHandoff(data: TAuthHandoff) {
  await authHandoffStore.save(data);
  await renderWithProviders(<ChangePasswordForm />);
  await screen.findByDisplayValue(data.identifier);
}

async function fillPasswordAndCode(code = '123456') {
  await fireEvent.changeText(screen.getByLabelText('Mật khẩu mới'), '12345678');
  await fireEvent.changeText(screen.getByLabelText('Xác nhận mật khẩu'), '12345678');
  await fireEvent.changeText(screen.getByLabelText('Code'), code);
}

describe('ChangePasswordForm', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  describe('init', () => {
    it('no handoff: EMAIL, resend enabled, no countdown', async () => {
      await renderWithProviders(<ChangePasswordForm />);

      expect(await screen.findByLabelText('Email')).toHaveDisplayValue('');
      expect(screen.queryByText(COUNTDOWN)).toBeNull();
      expect(resendButton()).toBeEnabled();
    });

    it('fresh RESET_PASSWORD handoff: identifier + login type pre-filled, countdown on, resend disabled', async () => {
      await renderWithHandoff(handoff());

      expect(screen.getByLabelText('Số điện thoại')).toHaveDisplayValue('0901234567');
      expect(screen.getByText(COUNTDOWN)).toBeTruthy();
      expect(resendButton()).toBeDisabled();
    });

    it('ignores an ACTIVATE_DISTRIBUTOR handoff', async () => {
      await authHandoffStore.save(handoff({ purpose: 'ACTIVATE_DISTRIBUTOR' }));
      await renderWithProviders(<ChangePasswordForm />);

      expect(await screen.findByLabelText('Email')).toHaveDisplayValue('');
      expect(screen.queryByText(COUNTDOWN)).toBeNull();
    });
  });

  it('switching tab clears the form and drops the countdown', async () => {
    await renderWithHandoff(handoff());
    await fireEvent.changeText(screen.getByLabelText('Code'), '123');

    await fireEvent.press(screen.getByRole('tab', { name: 'EMAIL' }));

    expect(screen.getByLabelText('Email')).toHaveDisplayValue('');
    expect(screen.getByLabelText('Code')).toHaveDisplayValue('');
    expect(screen.queryByText(COUNTDOWN)).toBeNull();
  });

  describe('resend', () => {
    it('success → RESET_PASSWORD resend, handoff saved, countdown starts', async () => {
      jest.mocked(resendCode).mockResolvedValue(undefined);
      await renderWithProviders(<ChangePasswordForm />);
      await fireEvent.changeText(await screen.findByLabelText('Email'), ' nongdan@example.com ');

      await fireEvent.press(resendButton());

      expect(await screen.findByText(COUNTDOWN)).toBeTruthy();
      expect(resendCode).toHaveBeenCalledWith({ identifier: 'nongdan@example.com', purpose: 'RESET_PASSWORD' });
      await waitFor(async () =>
        expect(await authHandoffStore.read('RESET_PASSWORD')).toEqual({
          loginType: 'EMAIL',
          identifier: 'nongdan@example.com',
          at: expect.any(String),
          purpose: 'RESET_PASSWORD',
        }),
      );
    });

    it('invalid identifier → field error, no request', async () => {
      await renderWithProviders(<ChangePasswordForm />);
      await fireEvent.changeText(await screen.findByLabelText('Email'), 'abc');

      await fireEvent.press(resendButton());

      expect(await screen.findByText('Email không hợp lệ')).toBeTruthy();
      expect(resendCode).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('password mismatch → client error, no request', async () => {
      await renderWithHandoff(handoff());
      await fillPasswordAndCode();
      await fireEvent.changeText(screen.getByLabelText('Xác nhận mật khẩu'), '87654321');

      await fireEvent.press(screen.getByRole('button', { name: SUBMIT }));

      expect(await screen.findByText('Mật khẩu xác nhận không khớp')).toBeTruthy();
      expect(confirmPasswordReset).not.toHaveBeenCalled();
    });

    it('success → sends identifier + code + newPassword only, clears handoff, toast, replace /auth/login', async () => {
      jest.mocked(confirmPasswordReset).mockResolvedValue(undefined);
      await renderWithHandoff(handoff());
      await fillPasswordAndCode();

      await fireEvent.press(screen.getByRole('button', { name: SUBMIT }));

      await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/auth/login'));
      expect(confirmPasswordReset).toHaveBeenCalledWith({
        identifier: '0901234567',
        code: '123456',
        newPassword: '12345678',
      });
      expect(toast.success).toHaveBeenCalled();
      expect(await authHandoffStore.read('RESET_PASSWORD')).toBeNull();
    });

    it('locks submit from success until redirect (no second request)', async () => {
      jest.mocked(confirmPasswordReset).mockResolvedValue(undefined);
      let release: () => void = () => undefined;
      const clear = jest
        .spyOn(authHandoffStore, 'clear')
        .mockImplementation(() => new Promise<void>((r) => (release = r)));
      await renderWithHandoff(handoff());
      await fillPasswordAndCode();

      await fireEvent.press(screen.getByRole('button', { name: SUBMIT }));
      await waitFor(() => expect(clear).toHaveBeenCalled());
      await fireEvent.press(screen.getByRole('button', { name: SUBMIT }));
      await act(async () => release());

      await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledTimes(1));
      expect(confirmPasswordReset).toHaveBeenCalledTimes(1);
      clear.mockRestore();
    });

    it.each([
      ['OTP_INVALID_CODE', 400, 'Mã xác nhận không đúng'],
      ['OTP_EXPIRED', 422, 'Mã đã hết hạn, bấm Gửi lại để nhận mã mới'],
    ])('%s → under code, no navigation, handoff kept', async (code, status, message) => {
      jest.mocked(confirmPasswordReset).mockRejectedValue(new AppError({ status, code, message: 'x' }));
      await renderWithHandoff(handoff());
      await fillPasswordAndCode();

      await fireEvent.press(screen.getByRole('button', { name: SUBMIT }));

      expect(await screen.findByText(message)).toBeTruthy();
      expect(screen.queryByRole('link', { name: 'Yêu cầu mã mới' })).toBeNull();
      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(await authHandoffStore.read('RESET_PASSWORD')).not.toBeNull();
    });

    it('OTP_NOT_FOUND → under identifier + reset-password link', async () => {
      jest
        .mocked(confirmPasswordReset)
        .mockRejectedValue(new AppError({ status: 404, code: 'OTP_NOT_FOUND', message: 'x' }));
      await renderWithHandoff(handoff());
      await fillPasswordAndCode();

      await fireEvent.press(screen.getByRole('button', { name: SUBMIT }));

      expect(await screen.findByText('Chưa có yêu cầu reset mật khẩu cho tài khoản này')).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Yêu cầu mã mới' })).toBeTruthy();
    });

    it('OTP_ALREADY_CONSUMED → under the form + reset-password link', async () => {
      const error = new AppError({ status: 422, code: 'OTP_ALREADY_CONSUMED', message: 'x' });
      jest.mocked(confirmPasswordReset).mockRejectedValue(error);
      await renderWithHandoff(handoff());
      await fillPasswordAndCode();

      await fireEvent.press(screen.getByRole('button', { name: SUBMIT }));

      expect(await screen.findByText(getErrorMessage(error))).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Yêu cầu mã mới' })).toBeTruthy();
    });

    it('OTP_BLOCKED with blockUntil → message under the form, no link', async () => {
      const error = new AppError({
        status: 422,
        code: 'OTP_BLOCKED',
        message: 'blocked',
        details: { blockUntil: '2026-10-08T09:30:00.000Z' },
      });
      jest.mocked(confirmPasswordReset).mockRejectedValue(error);
      await renderWithHandoff(handoff());
      await fillPasswordAndCode();

      await fireEvent.press(screen.getByRole('button', { name: SUBMIT }));

      expect(await screen.findByText(getErrorMessage(error))).toBeTruthy();
      expect(screen.queryByRole('link', { name: 'Yêu cầu mã mới' })).toBeNull();
    });
  });
});
