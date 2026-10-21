import { useAppQuery } from '@/shared/lib/query';
import type { TReviewSummaryParams } from '../types/review.types';
import { reviewSummaryQuery } from './review.queries';

/** Rating of a product / a distributor itself, in the `TReviewSummary` shape (RatingSummary). */
export const useReviewSummary = (params: TReviewSummaryParams) => useAppQuery(reviewSummaryQuery(params));
