import type { TDistributorReview } from '@/features/review';
import { ROUTES } from '@/shared/constants';

/**
 * Screen of a REVIEW notification's target. The recipient owns the target: shop review (USER) → the recipient's
 * profile; product review → that product's page.
 */
export const getReviewTargetRoute = (review: Pick<TDistributorReview, 'targetType' | 'targetId'>, distributorId: string) =>
  review.targetType === 'PRODUCT' ? ROUTES.product(review.targetId) : ROUTES.profile(distributorId);
