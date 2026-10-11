import { http } from '@/shared/lib/http';
import {
  createProduct,
  deleteProduct,
  getCategories,
  getDistributorProducts,
  getProductDetail,
  updateProduct,
} from './product.service';

jest.mock('@/shared/lib/http', () => ({
  http: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

describe('product.service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /products with shop, paging and signal', async () => {
    const { signal } = new AbortController();
    await getDistributorProducts({ distributorId: 'd1', cursor: 'c1', limit: 20 }, signal);
    expect(http.get).toHaveBeenCalledWith('/products', { query: { distributorId: 'd1', cursor: 'c1', limit: 20 }, signal });
  });

  it('GET /products/{id} (encoded) and /categories', async () => {
    await getProductDetail('a/b');
    expect(http.get).toHaveBeenCalledWith('/products/a%2Fb', { signal: undefined });
    await getCategories();
    expect(http.get).toHaveBeenCalledWith('/categories', { signal: undefined });
  });

  it('POST / PATCH / DELETE paths and bodies', async () => {
    const input = { name: 'A', description: 'B', price: 1, quantity: 1, categoryId: 'c1', unit: 'kg' as const, media: [] };
    await createProduct(input);
    expect(http.post).toHaveBeenCalledWith('/products', input);
    await updateProduct('p1', { status: 'INACTIVE' });
    expect(http.patch).toHaveBeenCalledWith('/products/p1', { status: 'INACTIVE' });
    await deleteProduct('p1');
    expect(http.delete).toHaveBeenCalledWith('/products/p1');
  });
});
