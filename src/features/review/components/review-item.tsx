import { memo } from 'react';
import { Text, View } from 'react-native';
import { Avatar, StarRating } from '@/shared/components/atoms';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { formatRelativeTime } from '@/shared/utils';
import { REVIEW_UNKNOWN_USER_NAME } from '../constants/review.constants';
import type { TDistributorReview } from '../types/review.types';

/** What a row shows — a shop list review (with `productName`) or a product review (no tag). */
export type TReviewItemData = Pick<TDistributorReview, 'user' | 'star' | 'content' | 'createdAt'> & {
  productName?: string | null;
};

export type TReviewItemProps = {
  review: TReviewItemData;
  /** Written by the logged-in user → highlighted + "Đánh giá của bạn". */
  isMine?: boolean;
  /** One reference time for the whole list. */
  now?: number;
  className?: string;
};

/** One review (image-6): avatar + username, stars, product tag (product review), content, relative time. */
export const ReviewItem = memo(function ReviewItem({ review, isMine = false, now, className }: TReviewItemProps) {
  const { user, star, content, productName, createdAt } = review;
  const name = user.username ?? REVIEW_UNKNOWN_USER_NAME;

  return (
    <View
      className={cn(
        'flex-row gap-3 border-b border-border-subtle px-4 py-3',
        isMine && 'bg-highlight-subtle',
        className,
      )}
    >
      <Avatar src={user.avatar} name={name} size="md" />
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text numberOfLines={1} className={cn(TEXT.labelLarge, 'shrink text-foreground')}>
            {name}
          </Text>
          {isMine && <Text className={cn(TEXT.labelSmall, 'shrink-0 text-highlight')}>Đánh giá của bạn</Text>}
        </View>
        <StarRating value={star} />
        {productName && (
          <Text numberOfLines={1} className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
            Sản phẩm: {productName}
          </Text>
        )}
        <Text className={cn(TEXT.bodyMedium, 'text-foreground')}>{content}</Text>
        <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>{formatRelativeTime(createdAt, now)}</Text>
      </View>
    </View>
  );
});
