import type { TDistributorReview, TDistributorReviewsPage } from '../types/review.types';

/** One item of GET /reviews. */
export const distributorReview = (overrides: Partial<TDistributorReview> = {}): TDistributorReview => ({
  id: 'rv1',
  targetType: 'USER',
  targetId: 'd1',
  productName: null,
  star: 5,
  content: 'Hàng tốt',
  createdAt: '2026-10-08T10:00:00.000Z',
  user: { id: 'f1', username: 'Bác Ba', avatar: null },
  ...overrides,
});

export const distributorReviewsPage = (overrides: Partial<TDistributorReviewsPage> = {}): TDistributorReviewsPage => ({
  summary: { avgRating: 5, reviewCount: 1, starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 } },
  reviews: [distributorReview()],
  nextCursor: null,
  ...overrides,
});
