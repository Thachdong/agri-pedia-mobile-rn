import { act, renderHook, waitFor } from '@testing-library/react-native';
import { queryKeys } from '@/shared/lib/query';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { createReview, getDistributorReviews } from '../services/review.service';
import { distributorReview, distributorReviewsPage } from '../test/review.fixtures';
import { useCreateReview } from './use-create-review';
import { useDistributorReviews } from './use-distributor-reviews';

jest.mock('../services/review.service');

describe('useDistributorReviews', () => {
  beforeEach(() => jest.resetAllMocks());

  it('summary from page 0, reviews merged, cursor followed', async () => {
    jest
      .mocked(getDistributorReviews)
      .mockResolvedValueOnce(distributorReviewsPage({ reviews: [distributorReview({ id: 'a' })], nextCursor: 'c1' }))
      .mockResolvedValueOnce(distributorReviewsPage({ reviews: [distributorReview({ id: 'b' })], nextCursor: null }));
    const { result } = await renderHook(() => useDistributorReviews({ distributorId: 'd1' }), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    await act(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.data?.reviews.map((r) => r.id)).toEqual(['a', 'b']));
    expect(result.current.data?.summary.reviewCount).toBe(1);
    expect(getDistributorReviews).toHaveBeenLastCalledWith({ distributorId: 'd1', cursor: 'c1', limit: 20 }, expect.anything());
  });
});

describe('useCreateReview', () => {
  beforeEach(() => jest.resetAllMocks());

  it('trims content; shop review → invalidates that shop\'s reviews', async () => {
    jest.mocked(createReview).mockResolvedValue({ reviewId: 'rv1' });
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useCreateReview(), { wrapper: hookWrapper(client) });

    await act(() => result.current.mutateAsync({ targetType: 'USER', targetId: 'd1', star: 5, content: '  Tốt  ' }));

    expect(createReview).toHaveBeenCalledWith({ targetType: 'USER', targetId: 'd1', star: 5, content: 'Tốt' });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.reviews.distributor('d1') });
  });

  it('product review → invalidates all reviews', async () => {
    jest.mocked(createReview).mockResolvedValue({ reviewId: 'rv2' });
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useCreateReview(), { wrapper: hookWrapper(client) });
    await act(() => result.current.mutateAsync({ targetType: 'PRODUCT', targetId: 'p1', star: 4, content: 'ok' }));
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.reviews.all });
  });
});
