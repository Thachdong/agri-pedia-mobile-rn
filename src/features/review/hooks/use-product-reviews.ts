import { useAppInfiniteQuery } from '@/shared/lib/query';
import type { TProductReview, TProductReviewsPage } from '../types/review.types';
import { productReviewsQuery } from './review.queries';

const toItems = ({ pages }: { pages: TProductReviewsPage[] }): TProductReview[] => pages.flatMap((page) => page.reviews);

/** Reviews of one product (infinite), all loaded pages merged. */
export const useProductReviews = (productId: string) =>
  useAppInfiniteQuery({ ...productReviewsQuery(productId), select: toItems });
