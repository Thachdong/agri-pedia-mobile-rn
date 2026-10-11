import { Text, View } from 'react-native';
import { StarRating } from '@/shared/components/atoms';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import type { TReviewSummary } from '../types/review.types';

const LEVELS = [1, 2, 3, 4, 5] as const;

export type TRatingSummaryProps = { summary: TReviewSummary; className?: string };

/** Shop rating (image-6): "Đánh giá: 4,5 / 5 · 12 đánh giá", then one row per star level with a bar and its count. */
export function RatingSummary({ summary, className }: TRatingSummaryProps) {
  const { avgRating, reviewCount, starCounts } = summary;
  const average = avgRating.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <View className={cn('gap-2 border-b border-border-subtle px-4 py-4', className)}>
      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
        <Text className={cn(TEXT.titleMedium, 'text-foreground')}>Đánh giá: {average} / 5</Text>
        <StarRating value={avgRating} />
        <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>{reviewCount} đánh giá</Text>
      </View>
      {LEVELS.map((level) => {
        const count = starCounts[level];
        const percent = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
        return (
          <View
            key={level}
            accessible
            accessibilityLabel={`${level} sao: ${count} đánh giá`}
            className="flex-row items-center gap-3"
          >
            <Text className={cn(TEXT.bodySmall, 'w-24 text-foreground')}>Số lượng {level} sao</Text>
            <View className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
              <View style={{ width: `${percent}%` }} className="h-full rounded-full bg-rating" />
            </View>
            <Text className={cn(TEXT.bodySmall, 'w-8 text-right text-muted-foreground')}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
}
