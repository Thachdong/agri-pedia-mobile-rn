// Route tests live here, not next to the route: every file under src/app becomes an Expo Router route.
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import HomeScreen from '@/app/index';
import { useSession, type TCurrentUser, type TSession } from '@/features/auth';

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));
jest.mock('@/features/user', () => ({ AccountHeaderActions: () => null }));
jest.mock('@/shared/components/organisms', () => ({ SiteHeader: () => null }));
jest.mock('@/features/article', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return { TopArticlesSection: () => <MockText>articles</MockText> };
});
jest.mock('@/features/diagnosis', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    HomeDiagnosisPanel: ({ guest }: { guest: boolean }) => <MockText>{`diagnosis:${guest ? 'guest' : 'user'}`}</MockText>,
  };
});
jest.mock('@/features/distributor', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    DistributorExplorerProvider: ({ ownShopId, children }: { ownShopId?: string; children: unknown }) => (
      <>
        <MockText>{`own:${ownShopId ?? '-'}`}</MockText>
        {children}
      </>
    ),
    DistributorExplorerSection: () => <MockText>section</MockText>,
    DistributorExplorerList: ({ header }: { header: ReactElement }) => (
      <>
        {header}
        <MockText>list</MockText>
      </>
    ),
  };
});

const guestSession: TSession = { status: 'guest', user: undefined, isLoggedIn: false };
const authenticatedSession = (user: Pick<TCurrentUser, 'id' | 'role'>): TSession =>
  ({ status: 'authenticated', user: { ...user, username: 'Người dùng', address: null }, isLoggedIn: true }) as TSession;

describe('HomeScreen "/"', () => {
  it('blocks in order: diagnosis → top articles → distributor section → list', async () => {
    jest.mocked(useSession).mockReturnValue(guestSession);
    await render(<HomeScreen />);
    const texts = screen.getAllByText(/^(diagnosis|articles|section|list)/).map((node) => node.props.children);
    expect(texts).toEqual(['diagnosis:guest', 'articles', 'section', 'list']);
  });

  it.each([
    ['guest', guestSession, 'diagnosis:guest', 'own:-'],
    ['FARMER', authenticatedSession({ id: 'f1', role: 'FARMER' }), 'diagnosis:user', 'own:-'],
    ['DISTRIBUTOR', authenticatedSession({ id: 'd9', role: 'DISTRIBUTOR' }), 'diagnosis:user', 'own:d9'],
  ])('%s → form mode and own shop', async (_, session, diagnosis, own) => {
    jest.mocked(useSession).mockReturnValue(session);
    await render(<HomeScreen />);
    expect(screen.getByText(diagnosis)).toBeOnTheScreen();
    expect(screen.getByText(own)).toBeOnTheScreen();
  });
});
