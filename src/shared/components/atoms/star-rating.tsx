import { View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { Icon, type TIconProps } from './icon';

const STARS = [1, 2, 3, 4, 5] as const;

export type TStarRatingProps = {
  /** 0..5, decimals allowed (rounded to the nearest half star). */
  value: number;
  size?: TIconProps['size'];
  className?: string;
};

/** Read-only stars (rating, review). One accessible image: "4,5 trên 5 sao". */
export function StarRating({ value, size = 'sm', className }: TStarRatingProps) {
  const rounded = Math.round(Math.min(Math.max(value, 0), 5) * 2) / 2;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${rounded.toLocaleString('vi-VN')} trên 5 sao`}
      className={cn('flex-row items-center gap-0.5', className)}
    >
      {STARS.map((star) => (
        <Icon
          key={star}
          name={rounded >= star ? 'star' : rounded >= star - 0.5 ? 'star-half' : 'star-outline'}
          size={size}
          color={rounded >= star - 0.5 ? 'rating' : 'ratingMuted'}
        />
      ))}
    </View>
  );
}
