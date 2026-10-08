import { http } from '@/shared/lib/http';
import { getProvinces, getWards } from './location.service';

jest.mock('@/shared/lib/http', () => ({ http: { get: jest.fn() } }));

describe('location.service', () => {
  beforeEach(() => jest.mocked(http.get).mockReset().mockResolvedValue({}));

  it('GET /provinces', async () => {
    await getProvinces();
    expect(http.get).toHaveBeenCalledWith('/provinces', { signal: undefined });
  });

  it('GET /provinces/{provinceCode}/wards with the code encoded and the abort signal', async () => {
    const { signal } = new AbortController();
    await getWards('ha_noi', signal);
    expect(http.get).toHaveBeenCalledWith('/provinces/ha_noi/wards', { signal });

    await getWards('a/b');
    expect(http.get).toHaveBeenLastCalledWith('/provinces/a%2Fb/wards', { signal: undefined });
  });
});
