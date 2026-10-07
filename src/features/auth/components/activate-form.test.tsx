import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AppError, getErrorMessage } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { renderWithProviders } from '@/test-utils';
import { activate, resendCode } from '../services/auth.service';
import type { TAuthHandoff } from '../types/auth.types';
import { authHandoffStore } from '../utils/auth-handoff.store';
import { ActivateForm } from './activate-form';

const mockRouter = { replace: jest.fn(), push: jest.fn(), back: jest.fn() };
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  Link: ({ children }: { children: unknown }) => children,
}));
jest.mock('@/shared/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('../services/auth.service');

const COUNTDOWN = /^0[0-3]:\d\d$/;

const handoff = (overrides: Partial<TAuthHandoff> = {}): TAuthHandoff => ({
  loginType: 'PHONE',
  identifier: '0901234567',
  at: new Date().toISOString(),
  purpose: 'ACTIVATE_DISTRIBUTOR',
  ...overrides,
});

const resendButton = () => screen.getByRole('button', { name: 'Gửi lại' });

async function renderWithHandoff(data: TAuthHandoff) {
  await authHandoffStore.save(data);
  await renderWithProviders(<ActivateForm />);
  await screen.findByDisplayValue(data.identifier);
}

describe('ActivateForm', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  describe('init', () => {
    it('no handoff: EMAIL, resend enabled, no countdown', async () => {
      await renderWithProviders(<ActivateForm />);

      expect(await screen.findByLabelText('Email')).toHaveDisplayValue('');
      expect(screen.queryByText(COUNTDOWN)).toBeNull();
      expect(resendButton()).toBeEnabled();
    });

    it('fresh handoff: identifier + login type pre-filled, countdown on, resend disabled', async () => {
      await renderWithHandoff(handoff());

      expect(screen.getByLabelText('Số điện thoại')).toHaveDisplayValue('0901234567');
      expect(screen.getByText(COUNTDOWN)).toBeTruthy();
      expect(resendButton()).toBeDisabled();
    });

    it('handoff older than 3 min: pre-filled but resend enabled, no countdown', async () => {
      await renderWithHandoff(handoff({ at: new Date(Date.now() - 4 * 60_000).toISOString() }));

      expect(screen.queryByText(COUNTDOWN)).toBeNull();
      expect(resendButton()).toBeEnabled();
    });
  });

  it('switching tab clears identifier + code and drops the countdown', async () => {
    await renderWithHandoff(handoff());
    await fireEvent.changeText(screen.getByLabelText('Code'), '123');

    await fireEvent.press(screen.getByRole('tab', { name: 'EMAIL' }));

    expect(screen.getByLabelText('Email')).toHaveDisplayValue('');
    expect(screen.getByLabelText('Code')).toHaveDisplayValue('');
    expect(screen.queryByText(COUNTDOWN)).toBeNull();
    expect(resendButton()).toBeEnabled();
  });

  describe('resend', () => {
    it('invalid identifier → field error, no request', async () => {
      await renderWithProviders(<ActivateForm />);
      await fireEvent.changeText(await screen.findByLabelText('Email'), 'abc');

      await fireEvent.press(resendButton());

      expect(await screen.findByText('Email không hợp lệ')).toBeTruthy();
      expect(resendCode).not.toHaveBeenCalled();
    });

    it('success → ACTIVATE_DISTRIBUTOR resend, handoff saved, countdown starts', async () => {
      jest.mocked(resendCode).mockResolvedValue(undefined);
      await renderWithProviders(<ActivateForm />);
      await fireEvent.changeText(await screen.findByLabelText('Email'), ' npp@example.com ');

      await fireEvent.press(resendButton());

      expect(await screen.findByText(COUNTDOWN)).toBeTruthy();
      expect(resendCode).toHaveBeenCalledWith({ identifier: 'npp@example.com', purpose: 'ACTIVATE_DISTRIBUTOR' });
      await waitFor(async () =>
        expect(await authHandoffStore.read('ACTIVATE_DISTRIBUTOR')).toEqual({
          loginType: 'EMAIL',
          identifier: 'npp@example.com',
          at: expect.any(String),
          purpose: 'ACTIVATE_DISTRIBUTOR',
        }),
      );
    });

    it('PHONE: sends and saves the phone without separators', async () => {
      jest.mocked(resendCode).mockResolvedValue(undefined);
      await renderWithProviders(<ActivateForm />);
      await fireEvent.press(await screen.findByRole('tab', { name: 'PHONE' }));
      await fireEvent.changeText(screen.getByLabelText('Số điện thoại'), '090 123.4567');

      await fireEvent.press(resendButton());

      await waitFor(() =>
        expect(resendCode).toHaveBeenCalledWith({ identifier: '0901234567', purpose: 'ACTIVATE_DISTRIBUTOR' }),
      );
      await waitFor(async () =>
        expect(await authHandoffStore.read('ACTIVATE_DISTRIBUTOR')).toMatchObject({
          loginType: 'PHONE',
          identifier: '0901234567',
        }),
      );
    });

    it('tab switched while sending: handoff keeps the sent login type, new tab stays idle', async () => {
      let resolve: () => void = () => undefined;
      jest.mocked(resendCode).mockImplementation(() => new Promise<void>((r) => (resolve = r)));
      await renderWithProviders(<ActivateForm />);
      await fireEvent.changeText(await screen.findByLabelText('Email'), 'npp@example.com');
      await fireEvent.press(resendButton());
      await waitFor(() => expect(resendCode).toHaveBeenCalled());

      await fireEvent.press(screen.getByRole('tab', { name: 'PHONE' }));
      await act(async () => resolve());

      await waitFor(async () =>
        expect(await authHandoffStore.read('ACTIVATE_DISTRIBUTOR')).toMatchObject({
          loginType: 'EMAIL',
          identifier: 'npp@example.com',
        }),
      );
      expect(screen.queryByText(COUNTDOWN)).toBeNull();
    });

    it('OTP_BLOCKED with blockUntil → message under the form', async () => {
      const error = new AppError({
        status: 422,
        code: 'OTP_BLOCKED',
        message: 'blocked',
        details: { blockUntil: '2026-10-07T09:30:00.000Z' },
      });
      jest.mocked(resendCode).mockRejectedValue(error);
      await renderWithProviders(<ActivateForm />);
      await fireEvent.changeText(await screen.findByLabelText('Email'), 'npp@example.com');

      await fireEvent.press(resendButton());

      expect(await screen.findByText(getErrorMessage(error))).toBeTruthy();
      expect(screen.queryByText(COUNTDOWN)).toBeNull();
    });
  });

  describe('activate', () => {
    it('empty code → asks for 6 digits, no request', async () => {
      await renderWithHandoff(handoff());

      await fireEvent.press(screen.getByRole('button', { name: 'ACTIVATE' }));

      expect(await screen.findByText('Vui lòng nhập đủ 6 chữ số')).toBeTruthy();
      expect(activate).not.toHaveBeenCalled();
    });

    it('success → sends identifier + code, clears handoff, toast, replace /auth/login', async () => {
      jest.mocked(activate).mockResolvedValue(undefined);
      await renderWithHandoff(handoff());
      await fireEvent.changeText(screen.getByLabelText('Code'), '123456');

      await fireEvent.press(screen.getByRole('button', { name: 'ACTIVATE' }));

      await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/auth/login'));
      expect(activate).toHaveBeenCalledWith({ identifier: '0901234567', code: '123456' });
      expect(toast.success).toHaveBeenCalled();
      expect(await authHandoffStore.read('ACTIVATE_DISTRIBUTOR')).toBeNull();
    });

    it.each([
      ['OTP_INVALID_CODE', 400, 'Mã kích hoạt không đúng'],
      ['OTP_EXPIRED', 422, 'Mã đã hết hạn, bấm Gửi lại để nhận mã mới'],
      ['OTP_NOT_FOUND', 404, 'Không tìm thấy mã kích hoạt cho tài khoản này'],
    ])('%s → field message, no navigation', async (code, status, message) => {
      jest.mocked(activate).mockRejectedValue(new AppError({ status, code, message: 'x' }));
      await renderWithHandoff(handoff());
      await fireEvent.changeText(screen.getByLabelText('Code'), '123456');

      await fireEvent.press(screen.getByRole('button', { name: 'ACTIVATE' }));

      expect(await screen.findByText(message)).toBeTruthy();
      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(await authHandoffStore.read('ACTIVATE_DISTRIBUTOR')).not.toBeNull();
    });

    it('OTP_ALREADY_CONSUMED → message under the form + login link', async () => {
      const error = new AppError({ status: 422, code: 'OTP_ALREADY_CONSUMED', message: 'x' });
      jest.mocked(activate).mockRejectedValue(error);
      await renderWithHandoff(handoff());
      await fireEvent.changeText(screen.getByLabelText('Code'), '123456');

      await fireEvent.press(screen.getByRole('button', { name: 'ACTIVATE' }));

      expect(await screen.findByText(getErrorMessage(error))).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Đăng nhập' })).toBeTruthy();
    });
  });
});
