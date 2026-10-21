import { fireEvent, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { useLogout } from '@/features/auth';
import { renderWithProviders } from '@/test-utils';
import { currentUser } from '../test/user.fixtures';
import { UserMenuSheet, type TUserMenuSheetProps } from './user-menu-sheet';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@/features/auth', () => ({ useLogout: jest.fn() }));

const mutate = jest.fn();
const onClose = jest.fn();

const renderSheet = (user = currentUser()) =>
  renderWithProviders(
    <UserMenuSheet sheetRef={createRef() as TUserMenuSheetProps['sheetRef']} onClose={onClose} user={user} />,
  );

describe('UserMenuSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLogout).mockReturnValue({ isPending: false, mutate } as unknown as ReturnType<typeof useLogout>);
  });

  it('shows the username', async () => {
    await renderSheet(currentUser({ username: 'Bác Ba' }));
    expect(screen.getByText('Bác Ba')).toBeOnTheScreen();
  });

  it('FARMER → "Trang cá nhân" closes the sheet and opens /profile/me', async () => {
    await renderSheet(currentUser({ id: 'f1', role: 'FARMER' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Trang cá nhân' }));
    expect(onClose).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/profile/me');
  });

  it('DISTRIBUTOR → "Trang cá nhân" closes the sheet and opens /profile/<id>', async () => {
    await renderSheet(currentUser({ id: 'd9', role: 'DISTRIBUTOR' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Trang cá nhân' }));
    expect(onClose).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/profile/d9');
  });

  it('Đăng xuất → closes the sheet, then logs out', async () => {
    await renderSheet();
    await fireEvent.press(screen.getByRole('button', { name: 'Đăng xuất' }));
    expect(onClose).toHaveBeenCalled();
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('logout pending → Đăng xuất disabled', async () => {
    jest.mocked(useLogout).mockReturnValue({ isPending: true, mutate } as unknown as ReturnType<typeof useLogout>);
    await renderSheet();
    expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeDisabled();
  });
});
