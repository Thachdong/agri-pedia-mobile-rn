// Route tests live here, not next to the route: every file under src/app becomes an Expo Router route.
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '@/app/index';
import { useSession, type TCurrentUser, type TSession } from '@/features/auth';

jest.mock('expo-router', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Link: ({ children }: { children: unknown }) => children,
    Redirect: ({ href }: { href: string }) => <MockText>redirect:{href}</MockText>,
  };
});
jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));
jest.mock('@/features/user', () => ({ AccountHeaderActions: () => null }));
jest.mock('@/features/distributor', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    DistributorExplorerProvider: ({ children }: { children: unknown }) => children,
    DistributorExplorerMap: () => <MockText>map</MockText>,
    DistributorExplorerFilter: () => <MockText>filter</MockText>,
    DistributorExplorerList: () => <MockText>list</MockText>,
  };
});

const guestSession: TSession = { status: 'guest', user: undefined, isLoggedIn: false };
const authenticatedSession = (user: Pick<TCurrentUser, 'id' | 'role'>): TSession =>
  ({ status: 'authenticated', user: { ...user, username: 'Người dùng', address: null }, isLoggedIn: true }) as TSession;

describe('HomeScreen "/"', () => {
  it.each([
    ['guest', guestSession],
    ['FARMER', authenticatedSession({ id: 'f1', role: 'FARMER' })],
  ])('%s → map, filter and list', async (_, session) => {
    jest.mocked(useSession).mockReturnValue(session);
    await render(<HomeScreen />);
    expect(screen.getByText('map')).toBeOnTheScreen();
    expect(screen.getByText('filter')).toBeOnTheScreen();
    expect(screen.getByText('list')).toBeOnTheScreen();
    expect(screen.queryByText(/redirect:/)).toBeNull();
  });

  it('logged-in DISTRIBUTOR → redirected to own profile', async () => {
    jest.mocked(useSession).mockReturnValue(authenticatedSession({ id: 'd9', role: 'DISTRIBUTOR' }));
    await render(<HomeScreen />);
    expect(screen.getByText('redirect:/profile/d9')).toBeOnTheScreen();
    expect(screen.queryByText('map')).toBeNull();
  });
});
