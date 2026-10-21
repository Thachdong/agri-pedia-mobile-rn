import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useSession, type TCurrentUser, type TSession } from '@/features/auth';
import { useDistributorProducts } from '@/features/product';
import { renderWithProviders } from '@/test-utils';
import { DistributorProductsTab } from './distributor-products-tab';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));
jest.mock('@/features/product', () => {
  const { Pressable: MockPressable, Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    useDistributorProducts: jest.fn(),
    ProductFormSheet: () => null,
    ProductCard: ({ product, onPress }: { product: { id: string; name: string }; onPress: (id: string) => void }) => (
      <MockPressable accessibilityRole="button" onPress={() => onPress(product.id)}>
        <MockText>{product.name}</MockText>
      </MockPressable>
    ),
  };
});

const session = (user?: Partial<TCurrentUser>): TSession =>
  user
    ? { status: 'authenticated', user: { id: 'u1', role: 'FARMER', ...user } as TCurrentUser, isLoggedIn: true }
    : { status: 'guest', user: undefined, isLoggedIn: false };
const products = (items: { id: string; name: string }[]) =>
  ({
    data: items,
    isPending: false,
    isError: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
  }) as unknown as ReturnType<typeof useDistributorProducts>;

describe('DistributorProductsTab', () => {
  beforeEach(() => jest.clearAllMocks());

  it('header + cards; card → product page; visitor has no "Thêm sản phẩm"', async () => {
    jest.mocked(useSession).mockReturnValue(session());
    jest.mocked(useDistributorProducts).mockReturnValue(products([{ id: 'p1', name: 'Lúa' }]));
    await renderWithProviders(<DistributorProductsTab distributorId="d1" header={<Text>INFO</Text>} />);
    expect(screen.getByText('INFO')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Lúa' }));
    expect(mockPush).toHaveBeenCalledWith('/product/p1');
    expect(screen.queryByRole('button', { name: 'Thêm sản phẩm' })).toBeNull();
  });

  it('owner → "Thêm sản phẩm"; empty → hint', async () => {
    jest.mocked(useSession).mockReturnValue(session({ id: 'd1', role: 'DISTRIBUTOR' }));
    jest.mocked(useDistributorProducts).mockReturnValue(products([]));
    await renderWithProviders(<DistributorProductsTab distributorId="d1" />);
    expect(screen.getByRole('button', { name: 'Thêm sản phẩm' })).toBeOnTheScreen();
    expect(screen.getByText('Chưa có sản phẩm')).toBeOnTheScreen();
  });

  it('odd count → filler cell keeps the last card in its own half', async () => {
    jest.mocked(useSession).mockReturnValue(session());
    jest.mocked(useDistributorProducts).mockReturnValue(
      products([
        { id: 'p1', name: 'A' },
        { id: 'p2', name: 'B' },
        { id: 'p3', name: 'C' },
      ]),
    );
    await renderWithProviders(<DistributorProductsTab distributorId="d1" />);
    // Last row = card C + an empty sibling cell.
    const row = screen.getByRole('button', { name: 'C' }).parent;
    expect(row?.children).toHaveLength(2);
  });
});

