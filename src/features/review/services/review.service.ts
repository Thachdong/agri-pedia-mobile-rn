import { http } from '@/shared/lib/http';
import type {
  TCreateReviewInput,
  TCreateReviewResponse,
  TDistributorReviewsPage,
  TDistributorReviewsParams,
  TProductReviewsPage,
  TReviewSummaryParams,
  TReviewSummaryResponse,
} from '../types/review.types';

/**
 * Public — shop (USER) reviews + reviews of every product the shop ever listed (deleted ones too), newest first.
 * 400 REVIEW_INVALID_CURSOR, 404 REVIEW_DISTRIBUTOR_NOT_FOUND.
 */
export const getDistributorReviews = (
  params: TDistributorReviewsParams & { cursor?: string; limit?: number },
  signal?: AbortSignal,
) => http.get<TDistributorReviewsPage>('/reviews', { query: params, signal });

/**
 * ACTIVE FARMER only (403 REVIEW_REVIEWER_NOT_ALLOWED), once per target (409 REVIEW_ALREADY_EXISTS); target gone → 404
 * REVIEW_TARGET_NOT_FOUND, product not ACTIVE → 422 REVIEW_INVALID_TARGET; 400 REVIEW_INVALID_STAR / REVIEW_INVALID_CONTENT.
 */
export const createReview = (input: TCreateReviewInput) => http.post<TCreateReviewResponse>('/reviews', input);

/** Public — reviews of one product (any status), newest first. Deleted / unknown → 404 REVIEW_TARGET_NOT_FOUND; 400 REVIEW_INVALID_CURSOR. */
export const getProductReviews = (
  productId: string,
  params: { cursor?: string; limit?: number },
  signal?: AbortSignal,
) => http.get<TProductReviewsPage>(`/reviews/products/${encodeURIComponent(productId)}`, { query: params, signal });

/** Public — rating of a product / a distributor itself. No review or unknown target → all zero. */
export const getReviewSummary = (params: TReviewSummaryParams, signal?: AbortSignal) =>
  http.get<TReviewSummaryResponse>('/reviews/summary', { query: params, signal });
