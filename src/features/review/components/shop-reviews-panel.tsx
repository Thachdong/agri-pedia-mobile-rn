import { useCallback, type ReactElement } from 'react';
import { InfiniteList } from '@/shared/components/organisms';
import { useDistributorReviews } from '../hooks/use-distributor-reviews';
import type { TDistributorReview } from '../types/review.types';
import { RatingSummary } from './rating-summary';
import { ReviewItem } from './review-item';

const keyExtractor = (review: TDistributorReview) => review.id;

export type TShopReviewsPanelProps = {
  distributorId: string;
  /** Logged-in user — their reviews are highlighted. */
  currentUserId?: string;
  /** Above the rating (profile info + tabs) — kept while reviews load. */
  header?: ReactElement | null;
  className?: string;
};

/** Tab "Đánh giá" (image-6): shop rating + shop & product reviews, newest first, infinite + pull-to-refresh. */
export function ShopReviewsPanel({ distributorId, currentUserId, header, className }: TShopReviewsPanelProps) {
  const query = useDistributorReviews({ distributorId });
  const summary = query.data?.summary;

  const renderItem = useCallback(
    (review: TDistributorReview) => <ReviewItem review={review} isMine={!!currentUserId && review.user.id === currentUserId} />,
    [currentUserId],
  );

  return (
    <InfiniteList
      query={query}
      items={query.data?.reviews ?? []}
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
      accessibilityLabel="Danh sách đánh giá"
      className={className}
    />
  );
}
