import { screen, waitFor } from '@testing-library/react-native';
import { useSession } from '@/features/auth';
import { AppError } from '@/shared/lib/http';
import { queryKeys } from '@/shared/lib/query';
import { renderWithProviders } from '@/test-utils';
import { getProductDetail } from '../services/product.service';
import { productDetail } from '../test/product.fixtures';
import { ProductDetailView } from './product-detail-view';

jest.mock('../services/product.service');
jest.mock('./product-detail-actions', () => ({ ProductDetailActions: () => null }));
jest.mock('./product-detail-info', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return { ProductDetailInfo: ({ isOwner }: { isOwner: boolean }) => <MockText>{isOwner ? 'INFO_OWNER' : 'INFO'}</MockText> };
});
jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));
jest.mock('@/features/review', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    ProductReviewsPanel: ({ header, currentUserId }: { header: React.ReactNode; currentUserId?: string }) => (
      <>
        {header}
        <MockText>REVIEWS {currentUserId}</MockText>
      </>
    ),
  };
});

describe('ProductDetailView', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loaded → info as the reviews list header; owner flag from the session', async () => {
    jest.mocked(useSession).mockReturnValue({ status: 'authenticated', user: { id: 'd1' }, isLoggedIn: true } as never);
    jest.mocked(getProductDetail).mockResolvedValue(productDetail());
    await renderWithProviders(<ProductDetailView productId="p1" />);
    expect(await screen.findByText('REVIEWS d1')).toBeOnTheScreen();
    expect(screen.getByText('INFO_OWNER')).toBeOnTheScreen();
  });

  it('not found → info only, no reviews', async () => {
    jest.mocked(useSession).mockReturnValue({ status: 'guest', user: undefined, isLoggedIn: false });
    jest
      .mocked(getProductDetail)
      .mockRejectedValue(new AppError({ status: 404, code: 'PRODUCT_NOT_FOUND', message: 'x' }));
    const { client } = await renderWithProviders(<ProductDetailView productId="p1" />);
    await waitFor(() => expect(client.getQueryState(queryKeys.products.detail('p1'))?.status).toBe('error'));
    expect(screen.getByText('INFO')).toBeOnTheScreen();
    expect(screen.queryByText(/REVIEWS/)).toBeNull();
  });
});
