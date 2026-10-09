import { http } from '@/shared/lib/http';
import { getDistributorReviews } from './review.service';

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
});
