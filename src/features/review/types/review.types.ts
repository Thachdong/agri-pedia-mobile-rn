import type { TApiPaths, TApiSchema } from '@/shared/lib/http';

/** Item of GET /reviews — `productName` null for a shop (USER) review; `user.avatar` signed URL or null. */
export type TDistributorReview = TApiSchema<'DistributorReviewResponse'>;
export type TReviewTargetType = TDistributorReview['targetType'];
export type TDistributorReviewsPage = TApiSchema<'ListDistributorReviewsResponse'>;

type TDistributorReviewsQuery = TApiPaths['/reviews']['get']['parameters']['query'];

/** Filters of a shop's review list — `cursor` / `limit` are paging. */
export type TDistributorReviewsParams = Omit<TDistributorReviewsQuery, 'cursor' | 'limit'>;

/** Look up one review of a shop by id (no GET /reviews/{id}) — e.g. from a REVIEW notification's `referenceId`. */
export type TFindDistributorReviewParams = { distributorId: string; reviewId: string };
