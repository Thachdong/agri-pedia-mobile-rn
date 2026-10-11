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

/** Shop rating over every review of the shop (shop + products) — not affected by filters / cursor. */
export type TReviewSummary = TApiSchema<'ReviewSummaryResponse'>;

/** All loaded pages merged — summary from the first page (the server returns it on every page). */
export type TDistributorReviewsView = { summary: TReviewSummary; reviews: TDistributorReview[] };

/** POST /reviews — USER: `targetId` = distributor id; PRODUCT: product id. */
export type TCreateReviewInput = TApiSchema<'CreateReviewDto'>;
export type TCreateReviewResponse = TApiSchema<'CreateReviewResponse'>;

/** Review form (M4 / M5) — the target comes from the sheet. `star` 0 = not chosen yet. */
export type TReviewFormValues = Pick<TCreateReviewInput, 'star' | 'content'>;

/** Item of GET /reviews/products/{id} — `user.avatar` signed URL or null. */
export type TProductReview = TApiSchema<'ProductReviewResponse'>;
export type TProductReviewsPage = TApiSchema<'ListProductReviewsResponse'>;

/** GET /reviews/summary — USER: the distributor's own reviews only (shop-wide summary is in GET /reviews). */
export type TReviewSummaryParams = TApiPaths['/reviews/summary']['get']['parameters']['query'];
export type TReviewSummaryResponse = TApiSchema<'GetReviewSummaryResponse'>;
