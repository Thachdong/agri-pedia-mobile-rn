import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useSession, type TCurrentUser, type TSession } from '@/features/auth';
import { useProductReviews } from '@/features/review';
import { AppError } from '@/shared/lib/http';
import { queryKeys } from '@/shared/lib/query';
import { toast } from '@/shared/lib/toast';
import { renderWithProviders } from '@/test-utils';
import { deleteProduct, getProductDetail } from '../services/product.service';
import { productDetail } from '../test/product.fixtures';
import { ProductDetailActions } from './product-detail-actions';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, canGoBack: () => true, replace: jest.fn() }),
  usePathname: () => '/product/p1',
}));
jest.mock('../services/product.service');
jest.mock('./product-form-sheet', () => ({ ProductFormSheet: () => null }));
jest.mock('@/features/auth', () => ({ useSession: jest.fn(), LoginRequiredSheet: () => null }));
jest.mock('@/features/review', () => ({ useProductReviews: jest.fn(), ReviewSheet: () => null }));
jest.mock('@/shared/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

/** No argument → guest; `{}` → FARMER u1. */
const session = (user?: Partial<TCurrentUser>): TSession =>
  user
    ? { status: 'authenticated', user: { id: 'u1', role: 'FARMER', ...user } as TCurrentUser, isLoggedIn: true }
    : { status: 'guest', user: undefined, isLoggedIn: false };
const reviewsBy = (userId?: string) =>
  ({ data: userId ? [{ user: { id: userId } }] : [] }) as unknown as ReturnType<typeof useProductReviews>;

describe('ProductDetailActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getProductDetail).mockResolvedValue(productDetail());
    jest.mocked(useProductReviews).mockReturnValue(reviewsBy());
  });

  it('owner → Sửa + Xoá; confirm deletes, toast, back', async () => {
    jest.mocked(useSession).mockReturnValue(session({ id: 'd1', role: 'DISTRIBUTOR' }));
    jest.mocked(deleteProduct).mockResolvedValue(undefined);
    await renderWithProviders(<ProductDetailActions productId="p1" />);
    expect(await screen.findByRole('button', { name: 'Sửa' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Đánh giá sản phẩm' })).toBeNull();

    expect(screen.getByRole('header', { name: 'Xoá sản phẩm?' })).toBeOnTheScreen();
    const [, confirm] = screen.getAllByRole('button', { name: 'Xoá' });
    await fireEvent.press(confirm!);

    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    expect(deleteProduct).toHaveBeenCalledWith('p1');
    expect(toast.success).toHaveBeenCalledWith('Đã xoá sản phẩm');
    // Mutation settles after its callbacks — wait so the update lands inside the test.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Huỷ' })).toBeEnabled());
  });

  it('owner delete fails → message in the confirm sheet, stays', async () => {
    jest.mocked(useSession).mockReturnValue(session({ id: 'd1', role: 'DISTRIBUTOR' }));
    jest.mocked(deleteProduct).mockRejectedValue(new AppError({ status: 403, code: 'PRODUCT_NOT_OWNER', message: 'x' }));
    await renderWithProviders(<ProductDetailActions productId="p1" />);
    const [, confirm] = await screen.findAllByRole('button', { name: 'Xoá' });
    await fireEvent.press(confirm!);
    expect(await screen.findByText('Bạn không phải chủ của sản phẩm này.')).toBeOnTheScreen();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('FARMER → Đánh giá sản phẩm enabled', async () => {
    jest.mocked(useSession).mockReturnValue(session({}));
    await renderWithProviders(<ProductDetailActions productId="p1" />);
    expect(await screen.findByRole('button', { name: 'Đánh giá sản phẩm' })).toBeEnabled();
  });

  it('FARMER who already reviewed the product → "Đã đánh giá" disabled', async () => {
    jest.mocked(useSession).mockReturnValue(session({}));
    jest.mocked(useProductReviews).mockReturnValue(reviewsBy('u1'));
    await renderWithProviders(<ProductDetailActions productId="p1" />);
    expect(await screen.findByRole('button', { name: 'Đã đánh giá' })).toBeDisabled();
  });

  it('guest → review button enabled (opens M1)', async () => {
    jest.mocked(useSession).mockReturnValue(session());
    await renderWithProviders(<ProductDetailActions productId="p1" />);
    expect(await screen.findByRole('button', { name: 'Đánh giá sản phẩm' })).toBeEnabled();
  });

  it('product not on sale → no review button', async () => {
    jest.mocked(getProductDetail).mockResolvedValue(productDetail({ status: 'OUT_OF_STOCK' }));
    jest.mocked(useSession).mockReturnValue(session({}));
    const { client } = await renderWithProviders(<ProductDetailActions productId="p1" />);
    await waitFor(() => expect(client.getQueryState(queryKeys.products.detail('p1'))?.status).toBe('success'));
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('another DISTRIBUTOR → no button', async () => {
    jest.mocked(useSession).mockReturnValue(session({ id: 'd2', role: 'DISTRIBUTOR' }));
    const { client } = await renderWithProviders(<ProductDetailActions productId="p1" />);
    await waitFor(() => expect(client.getQueryState(queryKeys.products.detail('p1'))?.status).toBe('success'));
    expect(screen.queryByRole('button')).toBeNull();
  });
});
