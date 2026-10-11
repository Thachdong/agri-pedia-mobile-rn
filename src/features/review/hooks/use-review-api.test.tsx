import { act, renderHook, waitFor } from '@testing-library/react-native';
import { queryKeys } from '@/shared/lib/query';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { createReview, getDistributorReviews, getProductReviews, getReviewSummary } from '../services/review.service';
import { distributorReview, distributorReviewsPage } from '../test/review.fixtures';
import { useCreateReview } from './use-create-review';
import { useDistributorReviews } from './use-distributor-reviews';
import { useProductReviews } from './use-product-reviews';
import { useReviewSummary } from './use-review-summary';

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

describe('useProductReviews / useReviewSummary', () => {
  beforeEach(() => jest.resetAllMocks());

  it('product reviews merged across pages', async () => {
    const review = (id: string) => ({ ...distributorReview({ id }), targetType: undefined });
    jest
      .mocked(getProductReviews)
      .mockResolvedValueOnce({ reviews: [review('a')], nextCursor: 'c1' } as never)
      .mockResolvedValueOnce({ reviews: [review('b')], nextCursor: null } as never);
    const { result } = await renderHook(() => useProductReviews('p1'), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    await act(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.data?.map((r) => r.id)).toEqual(['a', 'b']));
    expect(getProductReviews).toHaveBeenLastCalledWith('p1', { cursor: 'c1', limit: 20 }, expect.anything());
  });

  it('summary mapped to the RatingSummary shape', async () => {
    jest.mocked(getReviewSummary).mockResolvedValue({
      avgRating: 4.5,
      reviewCount: 2,
      oneStarCount: 0,
      twoStarCount: 0,
      threeStarCount: 0,
      fourStarCount: 1,
      fiveStarCount: 1,
    });
    const { result } = await renderHook(() => useReviewSummary({ targetType: 'PRODUCT', targetId: 'p1' }), {
      wrapper: hookWrapper(),
    });
    await waitFor(() =>
      expect(result.current.data).toEqual({
        avgRating: 4.5,
        reviewCount: 2,
        starCounts: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
      }),
    );
  });

  it('product review → invalidates all reviews (list + summary)', async () => {
    jest.mocked(createReview).mockResolvedValue({ reviewId: 'rv1' });
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useCreateReview(), { wrapper: hookWrapper(client) });
    await act(() => result.current.mutate({ targetType: 'PRODUCT', targetId: 'p1', star: 4, content: 'Tốt' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.reviews.all });
  });
});
