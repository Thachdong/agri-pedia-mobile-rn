import { fireEvent, screen } from '@testing-library/react-native';
import { useLogout, useSession } from '@/features/auth';
import { renderWithProviders } from '@/test-utils';
import { authenticatedSession, guestSession, loadingSession } from '../test/user.fixtures';
import { AccountHeaderActions } from './account-header-actions';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: unknown }) => children,
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('@/features/auth', () => ({ useSession: jest.fn(), useLogout: jest.fn() }));

describe('AccountHeaderActions', () => {
  beforeEach(() => {
    jest.mocked(useLogout).mockReturnValue({ isPending: false, mutate: jest.fn() } as unknown as ReturnType<
      typeof useLogout
    >);
  });

  it('guest → Login and Register, no account icons', async () => {
    jest.mocked(useSession).mockReturnValue(guestSession);
    await renderWithProviders(<AccountHeaderActions />);
    expect(screen.getByRole('button', { name: 'Login' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Register' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Thông báo' })).toBeNull();
  });

  it('session loading → neither Login nor account (no flash)', async () => {
    jest.mocked(useSession).mockReturnValue(loadingSession);
    await renderWithProviders(<AccountHeaderActions />);
    expect(screen.queryByRole('button', { name: 'Login' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Thông báo' })).toBeNull();
  });

  it('logged in → notification, chat, username + avatar; no Login', async () => {
    jest.mocked(useSession).mockReturnValue(authenticatedSession({ username: 'Bác Ba' }));
    await renderWithProviders(<AccountHeaderActions />);
    expect(screen.getByRole('button', { name: 'Thông báo' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Tin nhắn' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Tài khoản: Bác Ba' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Login' })).toBeNull();
  });

  it('logged in → account button opens the user menu (sheet content rendered)', async () => {
    jest.mocked(useSession).mockReturnValue(authenticatedSession());
    await renderWithProviders(<AccountHeaderActions />);
    await fireEvent.press(screen.getByRole('button', { name: 'Tài khoản: Nông dân A' }));
    expect(screen.getByRole('button', { name: /Đăng xuất/ })).toBeOnTheScreen();
  });
});
