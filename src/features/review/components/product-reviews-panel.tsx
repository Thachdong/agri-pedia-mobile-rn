import { useCallback, type ReactElement } from 'react';
import { InfiniteList } from '@/shared/components/organisms';
import { useProductReviews } from '../hooks/use-product-reviews';
import { useReviewSummary } from '../hooks/use-review-summary';
import type { TProductReview } from '../types/review.types';
import { RatingSummary } from './rating-summary';
import { ReviewItem } from './review-item';

const keyExtractor = (review: TProductReview) => review.id;

export type TProductReviewsPanelProps = {
  productId: string;
  /** Logged-in user — their review is highlighted. */
  currentUserId?: string;
  /** Above the rating (product detail) — kept while reviews load. */
  header?: ReactElement | null;
  className?: string;
};

/** Product detail (M3): product rating + its reviews, newest first, infinite + pull-to-refresh. */
export function ProductReviewsPanel({ productId, currentUserId, header, className }: TProductReviewsPanelProps) {
  const query = useProductReviews(productId);
  const { data: summary } = useReviewSummary({ targetType: 'PRODUCT', targetId: productId });

  const renderItem = useCallback(
    (review: TProductReview) => <ReviewItem review={review} isMine={!!currentUserId && review.user.id === currentUserId} />,
    [currentUserId],
  );

  return (
    <InfiniteList
      query={query}
      items={query.data ?? []}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      header={
        <>
          {header}
          {summary && <RatingSummary summary={summary} />}
        </>
      }
      keepHeader
      emptyIcon="star-outline"
      emptyTitle="Chưa có đánh giá"
      accessibilityLabel="Đánh giá sản phẩm"
      className={className}
    />
  );
}
