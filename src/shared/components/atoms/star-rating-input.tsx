import { Pressable, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { Icon } from './icon';

const STARS = [1, 2, 3, 4, 5] as const;

export type TStarRatingInputProps = {
  /** 0 = nothing chosen, 1..5. */
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  invalid?: boolean;
  accessibilityLabel?: string;
  className?: string;
};

/** Pick 1..5 stars (review forms) — a radio group, each star a 44pt target. */
export function StarRatingInput({
  value,
  onChange,
  disabled = false,
  invalid = false,
  accessibilityLabel = 'Số sao',
  className,
}: TStarRatingInputProps) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className={cn('flex-row items-center', disabled && 'opacity-50', className)}
    >
      {STARS.map((star) => (
        <Pressable
          key={star}
          accessibilityRole="radio"
          accessibilityLabel={`${star} sao`}
          accessibilityState={{ checked: value === star, disabled }}
          disabled={disabled}
          onPress={() => onChange(star)}
          className="h-11 w-11 items-center justify-center"
        >
          <Icon
            name={value >= star ? 'star' : 'star-outline'}
            size="lg"
            color={value >= star ? 'rating' : invalid ? 'destructive' : 'ratingMuted'}
          />
        </Pressable>
      ))}
    </View>
  );
}
