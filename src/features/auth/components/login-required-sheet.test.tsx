import { fireEvent, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { renderWithProviders } from '@/test-utils';
import { LoginRequiredSheet, type TLoginRequiredSheetProps } from './login-required-sheet';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }), usePathname: () => '/profile/d1' }));

const onClose = jest.fn();
const renderSheet = () =>
  renderWithProviders(
    <LoginRequiredSheet
      sheetRef={createRef() as TLoginRequiredSheetProps['sheetRef']}
      onClose={onClose}
      description="Đăng nhập để chat."
    />,
  );

describe('LoginRequiredSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('login → closes and opens login with `from` = current screen', async () => {
    await renderSheet();
    expect(screen.getByText('Đăng nhập để chat.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(onClose).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/auth/login', params: { from: '/profile/d1' } });
  });

  it('register → register screen', async () => {
    await renderSheet();
    await fireEvent.press(screen.getByRole('button', { name: 'Đăng ký' }));
    expect(mockPush).toHaveBeenCalledWith('/auth/register');
  });
});
