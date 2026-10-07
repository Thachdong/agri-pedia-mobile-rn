import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import { tokenStore } from '@/shared/lib/auth';
import { AppError } from '@/shared/lib/http';
import { renderWithProviders } from '@/test-utils';
import { login } from '../services/auth.service';
import { loginResponse } from '../test/auth.fixtures';
import { authHandoffStore } from '../utils/auth-handoff.store';
import { loginHandoffStore } from '../utils/login-handoff.store';
import { LoginForm } from './login-form';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: unknown }) => children,
}));
jest.mock('../services/auth.service');

const submit = () => fireEvent.press(screen.getByRole('button', { name: 'LOGIN' }));

async function renderAndFill(identifier: string, password = 'secret', loginType: 'EMAIL' | 'PHONE' = 'EMAIL') {
  await renderWithProviders(<LoginForm />);
  if (loginType === 'PHONE') await fireEvent.press(await screen.findByRole('tab', { name: 'PHONE' }));
  await fireEvent.changeText(screen.getByLabelText(loginType === 'PHONE' ? 'Số điện thoại' : 'Email'), identifier);
  await fireEvent.changeText(screen.getByLabelText('Mật khẩu'), password);
}

describe('LoginForm', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    await tokenStore.clear();
  });

  describe('init', () => {
    it('no pre-fill: EMAIL tab, empty fields, identifier focused', async () => {
      const focus = jest.spyOn(TextInput.prototype, 'focus');
      await renderWithProviders(<LoginForm />);

      await waitFor(() => expect(focus).toHaveBeenCalledTimes(1));

      expect(screen.getByRole('tab', { name: 'EMAIL' })).toBeSelected();
      expect(screen.getByLabelText('Email')).toHaveDisplayValue('');
      expect(screen.getByLabelText('Mật khẩu')).toHaveDisplayValue('');
      focus.mockRestore();
    });

    it('pre-fill: login type + identifier filled, password focused', async () => {
      await loginHandoffStore.save({ loginType: 'PHONE', identifier: '0901234567' });
      const focus = jest.spyOn(TextInput.prototype, 'focus');
      await renderWithProviders(<LoginForm />);

      expect(await screen.findByDisplayValue('0901234567')).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'PHONE' })).toBeSelected();
      await waitFor(() => expect(focus).toHaveBeenCalled());
      // Last focused input = the password (compared by a prop: printing a TextInput instance on failure hangs jest).
      const lastFocused = focus.mock.contexts.at(-1) as { props?: { textContentType?: string } } | undefined;
      expect(lastFocused?.props?.textContentType).toBe('password');
      focus.mockRestore();
    });
  });

  it('switching tab clears the identifier and swaps the field', async () => {
    await renderAndFill('abc');
    await submit();
    expect(await screen.findByText('Email không hợp lệ')).toBeTruthy();

    await fireEvent.press(screen.getByRole('tab', { name: 'PHONE' }));

    expect(screen.getByLabelText('Số điện thoại')).toHaveDisplayValue('');
    expect(screen.queryByText('Email không hợp lệ')).toBeNull();
  });

  it('invalid identifier / empty password → field errors, no request', async () => {
    await renderAndFill('0901', '', 'PHONE');

    await submit();

    expect(await screen.findByText('Số điện thoại không hợp lệ')).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it('success → normalized identifier sent, session started, pre-fill cleared, button stays busy', async () => {
    jest.mocked(login).mockResolvedValue(loginResponse());
    await loginHandoffStore.save({ loginType: 'PHONE', identifier: '0901234567' });
    await renderWithProviders(<LoginForm />);
    await screen.findByDisplayValue('0901234567');
    await fireEvent.changeText(screen.getByLabelText('Số điện thoại'), '090 123.4567');
    await fireEvent.changeText(screen.getByLabelText('Mật khẩu'), 'secret');

    await submit();

    await waitFor(() => expect(tokenStore.get()).toEqual({ accessToken: 'access-1', refreshToken: 'refresh-1' }));
    expect(login).toHaveBeenCalledWith({ loginType: 'PHONE', identifier: '0901234567', password: 'secret' });
    expect(await loginHandoffStore.read()).toBeNull();
    await waitFor(() => expect(screen.getByRole('button', { name: 'LOGIN' })).toBeDisabled());
  });

  it('USER_INVALID_CREDENTIALS → under the form, no activate link, no session', async () => {
    jest.mocked(login).mockRejectedValue(new AppError({ status: 401, code: 'USER_INVALID_CREDENTIALS', message: 'x' }));
    await renderAndFill('nongdan@example.com');

    await submit();

    expect(await screen.findByText('Email/số điện thoại hoặc mật khẩu không đúng.')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Kích hoạt' })).toBeNull();
    expect(tokenStore.get()).toBeNull();
    expect(screen.getByRole('button', { name: 'LOGIN' })).toBeEnabled();
  });

  it('USER_NOT_ACTIVE → message + activate link, activate handoff saved with resend enabled', async () => {
    jest.mocked(login).mockRejectedValue(new AppError({ status: 403, code: 'USER_NOT_ACTIVE', message: 'x' }));
    await renderAndFill('npp@example.com');

    await submit();

    expect(await screen.findByText('Tài khoản chưa được kích hoạt.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Kích hoạt' })).toBeTruthy();
    expect(await authHandoffStore.read('ACTIVATE_DISTRIBUTOR')).toEqual({
      loginType: 'EMAIL',
      identifier: 'npp@example.com',
      at: new Date(0).toISOString(),
      purpose: 'ACTIVATE_DISTRIBUTOR',
    });
  });
});
