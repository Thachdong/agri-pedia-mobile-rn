import { act, renderHook, waitFor } from '@testing-library/react-native';
import { queryKeys } from '@/shared/lib/query';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import {
  createProduct,
  deleteProduct,
  getCategories,
  getDistributorProducts,
  updateProduct,
} from '../services/product.service';
import { distributorProduct, distributorProductsPage, productDetail } from '../test/product.fixtures';
import { useCategories } from './use-categories';
import { useCreateProduct } from './use-create-product';
import { useDeleteProduct } from './use-delete-product';
import { useDistributorProducts } from './use-distributor-products';
import { useUpdateProduct } from './use-update-product';

jest.mock('../services/product.service');

describe('product query hooks', () => {
  beforeEach(() => jest.resetAllMocks());

  it('useDistributorProducts merges pages and follows the cursor', async () => {
    jest
      .mocked(getDistributorProducts)
      .mockResolvedValueOnce(distributorProductsPage({ products: [distributorProduct({ id: 'a' })], nextCursor: 'c1' }))
      .mockResolvedValueOnce(distributorProductsPage({ products: [distributorProduct({ id: 'b' })], nextCursor: null }));
    const { result } = await renderHook(() => useDistributorProducts('d1'), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    await act(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.data?.map((p) => p.id)).toEqual(['a', 'b']));
    expect(result.current.hasNextPage).toBe(false);
    expect(getDistributorProducts).toHaveBeenLastCalledWith({ distributorId: 'd1', cursor: 'c1', limit: 20 }, expect.anything());
  });

  it('useCategories selects the items', async () => {
    jest.mocked(getCategories).mockResolvedValue({ items: [{ id: 'c1', name: 'Hạt giống' }] });
    const { result } = await renderHook(() => useCategories(), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.data).toEqual([{ id: 'c1', name: 'Hạt giống' }]));
  });
});

describe('product mutation hooks', () => {
  beforeEach(() => jest.resetAllMocks());

  it('create → invalidates the shop list', async () => {
    jest.mocked(createProduct).mockResolvedValue({ productId: 'p9' });
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useCreateProduct('d1'), { wrapper: hookWrapper(client) });

    const input = { name: 'A', description: 'B', price: 1, quantity: 1, categoryId: 'c1', unit: 'kg' as const, media: [] };
    await act(() => result.current.mutateAsync(input));

    expect(createProduct).toHaveBeenCalledWith(input);
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.products.list('d1') });
  });

  it('update → invalidates detail + shop list', async () => {
    jest.mocked(updateProduct).mockResolvedValue(undefined);
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useUpdateProduct('d1'), { wrapper: hookWrapper(client) });

    await act(() => result.current.mutateAsync({ productId: 'p1', input: { status: 'INACTIVE' } }));

    expect(updateProduct).toHaveBeenCalledWith('p1', { status: 'INACTIVE' });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.products.detail('p1') });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.products.list('d1') });
  });

  it('delete → invalidates the shop list; detail kept but stale, not refetched', async () => {
    jest.mocked(deleteProduct).mockResolvedValue(undefined);
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.products.detail('p1'), productDetail());
    const spy = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useDeleteProduct('d1'), { wrapper: hookWrapper(client) });

    await act(() => result.current.mutateAsync('p1'));

    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.products.list('d1') });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.products.detail('p1'), refetchType: 'none' });
    expect(client.getQueryState(queryKeys.products.detail('p1'))?.isInvalidated).toBe(true);
    expect(client.getQueryData(queryKeys.products.detail('p1'))).toEqual(productDetail());
  });
});
