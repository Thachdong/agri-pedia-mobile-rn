import { http } from '@/shared/lib/http';
import { getDistributorReviews, getProductReviews, getReviewSummary } from './review.service';

jest.mock('@/shared/lib/http', () => ({ http: { get: jest.fn() } }));

describe('review.service', () => {
  beforeEach(() => jest.mocked(http.get).mockReset().mockResolvedValue({}));

  it('GET /reviews with filters, paging and the abort signal', async () => {
    const { signal } = new AbortController();
    await getDistributorReviews({ distributorId: 'd1', targetType: 'PRODUCT', cursor: 'c1', limit: 50 }, signal);
    expect(http.get).toHaveBeenCalledWith('/reviews', {
      query: { distributorId: 'd1', targetType: 'PRODUCT', cursor: 'c1', limit: 50 },
      signal,
    });
  });

  it('GET /reviews/products/{id} with paging', async () => {
    await getProductReviews('p1', { cursor: 'c1', limit: 20 });
    expect(http.get).toHaveBeenCalledWith('/reviews/products/p1', { query: { cursor: 'c1', limit: 20 }, signal: undefined });
  });

  it('GET /reviews/summary with target', async () => {
    await getReviewSummary({ targetType: 'PRODUCT', targetId: 'p1' });
    expect(http.get).toHaveBeenCalledWith('/reviews/summary', {
      query: { targetType: 'PRODUCT', targetId: 'p1' },
      signal: undefined,
    });
  });
});
