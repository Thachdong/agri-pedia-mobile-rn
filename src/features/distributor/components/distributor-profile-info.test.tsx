import { screen } from '@testing-library/react-native';
import { useSession } from '@/features/auth';
import { renderWithProviders } from '@/test-utils';
import { DistributorProfileInfo } from './distributor-profile-info';

jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));

const GUEST = { status: 'guest', user: undefined, isLoggedIn: false } as const;
const loggedInAs = (id: string) =>
  ({ status: 'authenticated', user: { id }, isLoggedIn: true }) as unknown as ReturnType<typeof useSession>;

describe('DistributorProfileInfo', () => {
  it('renders the 5 info rows of the wireframe', async () => {
    jest.mocked(useSession).mockReturnValue(GUEST);
    await renderWithProviders(<DistributorProfileInfo distributorId="d1" />);
    for (const label of ['Email / Phone', 'Giấy phép kinh doanh', 'Địa chỉ', 'Lĩnh vực kinh doanh', 'Giới thiệu']) {
      expect(screen.getByText(label)).toBeOnTheScreen();
    }
  });

  it('guest → Chat visible', async () => {
    jest.mocked(useSession).mockReturnValue(GUEST);
    await renderWithProviders(<DistributorProfileInfo distributorId="d1" />);
    expect(screen.getByRole('button', { name: 'Chat' })).toBeOnTheScreen();
  });

  it('another user → Chat visible', async () => {
    jest.mocked(useSession).mockReturnValue(loggedInAs('u2'));
    await renderWithProviders(<DistributorProfileInfo distributorId="d1" />);
    expect(screen.getByRole('button', { name: 'Chat' })).toBeOnTheScreen();
  });

  it('owner (own profile) → Chat hidden', async () => {
    jest.mocked(useSession).mockReturnValue(loggedInAs('d1'));
    await renderWithProviders(<DistributorProfileInfo distributorId="d1" />);
    expect(screen.queryByRole('button', { name: 'Chat' })).toBeNull();
  });
});
