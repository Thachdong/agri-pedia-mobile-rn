import { useAppInfiniteQuery } from '@/shared/lib/query';
import type { TDistributorReviewsPage, TDistributorReviewsParams, TDistributorReviewsView } from '../types/review.types';
import { distributorReviewsQuery } from './review.queries';

const EMPTY_SUMMARY: TDistributorReviewsView['summary'] = {
  avgRating: 0,
  reviewCount: 0,
  starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

const toView = ({ pages }: { pages: TDistributorReviewsPage[] }): TDistributorReviewsView => ({
  summary: pages[0]?.summary ?? EMPTY_SUMMARY,
  reviews: pages.flatMap((page) => page.reviews),
});

/** Tab "Đánh giá": shop rating + shop & product reviews (infinite). */
export const useDistributorReviews = (params: TDistributorReviewsParams) =>
  useAppInfiniteQuery({ ...distributorReviewsQuery(params), select: toView });
