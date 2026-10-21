import { http } from '@/shared/lib/http';
import { getNearbyDistributors } from './distributor.service';

jest.mock('@/shared/lib/http', () => ({ http: { get: jest.fn() } }));

describe('distributor.service', () => {
  beforeEach(() => jest.mocked(http.get).mockReset().mockResolvedValue({}));

  it('GET /distributors/nearby with the filter + page as query and the abort signal', async () => {
    const { signal } = new AbortController();
    await getNearbyDistributors({ provinceCode: 'ha_noi', page: 2, limit: 20 }, signal);
    expect(http.get).toHaveBeenCalledWith('/distributors/nearby', {
      query: { provinceCode: 'ha_noi', page: 2, limit: 20 },
      signal,
    });
  });
});
