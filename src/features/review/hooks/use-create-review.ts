import { queryKeys, useAppMutation } from '@/shared/lib/query';
import { createReview } from '../services/review.service';
import type { TCreateReviewInput } from '../types/review.types';

/**
 * Review a shop (USER) or a product. Stale: shop review → every review query of that shop (list + summary);
 * product review → all reviews (the product's shop isn't known here). `silent`: the review sheet shows errors.
 */
export const useCreateReview = () =>
  useAppMutation({
    mutationFn: (input: TCreateReviewInput) => createReview({ ...input, content: input.content.trim() }),
    invalidates: ({ targetType, targetId }) => [
      targetType === 'USER' ? queryKeys.reviews.distributor(targetId) : queryKeys.reviews.all,
    ],
    meta: { silent: true },
  });
