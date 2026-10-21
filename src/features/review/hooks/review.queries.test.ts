import { createTestQueryClient } from '@/test-utils';
import { getDistributorReviews } from '../services/review.service';
import { distributorReview, distributorReviewsPage } from '../test/review.fixtures';
import { findDistributorReviewQuery } from './review.queries';

jest.mock('../services/review.service');

describe('findDistributorReviewQuery', () => {
  beforeEach(() => jest.resetAllMocks());

  it('found on a later page → follows nextCursor, returns the review', async () => {
    jest
      .mocked(getDistributorReviews)
      .mockResolvedValueOnce(distributorReviewsPage({ reviews: [distributorReview({ id: 'other' })], nextCursor: 'c1' }))
      .mockResolvedValueOnce(
        distributorReviewsPage({ reviews: [distributorReview({ id: 'rv1', targetType: 'PRODUCT', targetId: 'p1' })] }),
      );

    const review = await createTestQueryClient().fetchQuery(findDistributorReviewQuery({ distributorId: 'd1', reviewId: 'rv1' }));

    expect(review).toMatchObject({ id: 'rv1', targetType: 'PRODUCT', targetId: 'p1' });
    expect(getDistributorReviews).toHaveBeenNthCalledWith(1, { distributorId: 'd1', cursor: undefined, limit: 50 }, expect.anything());
    expect(getDistributorReviews).toHaveBeenNthCalledWith(2, { distributorId: 'd1', cursor: 'c1', limit: 50 }, expect.anything());
  });

  it('last page without it → null', async () => {
    jest.mocked(getDistributorReviews).mockResolvedValueOnce(distributorReviewsPage({ reviews: [], nextCursor: null }));
    const review = await createTestQueryClient().fetchQuery(findDistributorReviewQuery({ distributorId: 'd1', reviewId: 'rv1' }));
    expect(review).toBeNull();
    expect(getDistributorReviews).toHaveBeenCalledTimes(1);
  });

  it('stops after 3 pages → null', async () => {
    jest
      .mocked(getDistributorReviews)
      .mockResolvedValue(distributorReviewsPage({ reviews: [distributorReview({ id: 'other' })], nextCursor: 'more' }));
    const review = await createTestQueryClient().fetchQuery(findDistributorReviewQuery({ distributorId: 'd1', reviewId: 'rv1' }));
    expect(review).toBeNull();
    expect(getDistributorReviews).toHaveBeenCalledTimes(3);
  });
});
