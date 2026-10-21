import { act, renderHook, waitFor } from '@testing-library/react-native';
import { hookWrapper } from '@/test-utils';
import { getNearbyDistributors } from '../services/distributor.service';
import { nearbyDistributor, nearbyResponse } from '../test/distributor.fixtures';
import { NEARBY_DISTRIBUTORS_PAGE_SIZE } from './distributor.queries';
import { useNearbyDistributors } from './use-nearby-distributors';

jest.mock('../services/distributor.service');

describe('useNearbyDistributors', () => {
  beforeEach(() => jest.resetAllMocks());

  it('loads page 1 with the params and merges into one view', async () => {
    jest.mocked(getNearbyDistributors).mockResolvedValue(nearbyResponse({ scope: 'province', source: 'query_area' }));
    const { result } = await renderHook(() => useNearbyDistributors({ provinceCode: 'ha_noi' }), {
      wrapper: hookWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getNearbyDistributors).toHaveBeenCalledWith(
      { provinceCode: 'ha_noi', page: 1, limit: NEARBY_DISTRIBUTORS_PAGE_SIZE },
      expect.anything(),
    );
    expect(result.current.data).toEqual({
      scope: 'province',
      source: 'query_area',
      total: 1,
      items: [nearbyDistributor()],
    });
    expect(result.current.hasNextPage).toBe(false);
  });

  it('page-based: next page while loaded < total, appends, then stops', async () => {
    jest
      .mocked(getNearbyDistributors)
      .mockResolvedValueOnce(nearbyResponse({ items: [nearbyDistributor({ userId: 'd1' })], total: 2 }))
      .mockResolvedValueOnce(nearbyResponse({ items: [nearbyDistributor({ userId: 'd2' })], total: 2 }));
    const { result } = await renderHook(() => useNearbyDistributors({}), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    await act(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.data?.items).toHaveLength(2));
    expect(getNearbyDistributors).toHaveBeenLastCalledWith(
      { page: 2, limit: NEARBY_DISTRIBUTORS_PAGE_SIZE },
      expect.anything(),
    );
    expect(result.current.data?.items.map((item) => item.userId)).toEqual(['d1', 'd2']);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('an empty page ends the list even if total says more', async () => {
    jest.mocked(getNearbyDistributors).mockResolvedValue(nearbyResponse({ items: [], total: 5 }));
    const { result } = await renderHook(() => useNearbyDistributors({}), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('enabled: false → no request (waiting for the location)', async () => {
    const { result } = await renderHook(() => useNearbyDistributors({}, { enabled: false }), {
      wrapper: hookWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(getNearbyDistributors).not.toHaveBeenCalled();
  });
});
