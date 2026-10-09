import { http } from '@/shared/lib/http';
import type { TDistributorReviewsPage, TDistributorReviewsParams } from '../types/review.types';

/**
 * Public — shop (USER) reviews + reviews of every product the shop ever listed (deleted ones too), newest first.
 * 400 REVIEW_INVALID_CURSOR, 404 REVIEW_DISTRIBUTOR_NOT_FOUND.
 */
export const getDistributorReviews = (
  params: TDistributorReviewsParams & { cursor?: string; limit?: number },
  signal?: AbortSignal,
) => http.get<TDistributorReviewsPage>('/reviews', { query: params, signal });
