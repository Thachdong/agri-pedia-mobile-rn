import { screen } from '@testing-library/react-native';
import { useSession } from '@/features/auth';
import { renderWithProviders } from '@/test-utils';
import { authenticatedSession, loadingSession } from '../test/user.fixtures';
import { FarmerProfileInfo } from './farmer-profile-info';

jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));
jest.mock('./manage-addresses-section', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    ManageAddressesSection: ({ userId }: { userId: string }) => <Text>{`ADDRESSES ${userId}`}</Text>,
  };
});
jest.mock('./edit-profile-sheet', () => ({ EditProfileSheet: () => null }));

describe('FarmerProfileInfo', () => {
  beforeEach(() => jest.clearAllMocks());

  it('own info: username, Chỉnh sửa, Email / Phone, Giới thiệu, addresses of the user', async () => {
    jest.mocked(useSession).mockReturnValue(
      authenticatedSession({
        id: 'f1',
        username: 'Bác Ba',
        email: null,
        phone: '0912345678',
        bio: 'Trồng lúa',
      }),
    );
    await renderWithProviders(<FarmerProfileInfo />);

    expect(screen.getByRole('header', { name: 'Bác Ba' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Chỉnh sửa' })).toBeOnTheScreen();
    expect(screen.getByText('0912345678')).toBeOnTheScreen();
    expect(screen.getByText('Trồng lúa')).toBeOnTheScreen();
    expect(screen.getByText('ADDRESSES f1')).toBeOnTheScreen();
  });

  it('session loading → spinner only', async () => {
    jest.mocked(useSession).mockReturnValue(loadingSession);
    await renderWithProviders(<FarmerProfileInfo />);
    expect(screen.getByLabelText('Đang tải thông tin')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Chỉnh sửa' })).toBeNull();
  });
});
