import { appQueryOptions, queryKeys } from '@/shared/lib/query';
import { getDistributorReviews } from '../services/review.service';
import type { TDistributorReview, TFindDistributorReviewParams } from '../types/review.types';

/** Lookup pages: a review referenced by a notification is recent, so it is almost always on page 1. */
const FIND_REVIEW_PAGE_SIZE = 50;
const FIND_REVIEW_MAX_PAGES = 3;

/**
 * One review of a shop by id, `null` when not in the newest 150 (no GET /reviews/{id} in the API).
 * A review's target never changes → never stale. `silent`: the caller decides how to show a failure.
 */
export const findDistributorReviewQuery = ({ distributorId, reviewId }: TFindDistributorReviewParams) =>
  appQueryOptions({
    queryKey: queryKeys.reviews.find(distributorId, reviewId),
    queryFn: async ({ signal }): Promise<TDistributorReview | null> => {
      let cursor: string | undefined;
      for (let page = 0; page < FIND_REVIEW_MAX_PAGES; page += 1) {
        const { reviews, nextCursor } = await getDistributorReviews(
          { distributorId, cursor, limit: FIND_REVIEW_PAGE_SIZE },
          signal,
        );
        const review = reviews.find((item) => item.id === reviewId);
        if (review) return review;
        if (!nextCursor) break;
        cursor = nextCursor;
      }
      return null;
    },
    staleTime: Infinity,
    meta: { silent: true },
  });
