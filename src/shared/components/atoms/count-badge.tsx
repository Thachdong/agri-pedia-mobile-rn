import { Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';

export type TCountBadgeProps = {
  count: number;
  /** Above this → `<max>+`. */
  max?: number;
  /** `count` is only a lower bound (e.g. counted on loaded pages) → `<count>+`. */
  atLeast?: boolean;
  className?: string;
};

export const formatCount = (count: number, max = 99, atLeast = false) =>
  count > max ? `${max}+` : atLeast ? `${count}+` : String(count);

/**
 * Count dot (unread...). `count <= 0` → nothing rendered. Hidden from screen readers: the control around it
 * reads the number in its label. Same as web.
 */
export function CountBadge({ count, max = 99, atLeast = false, className }: TCountBadgeProps) {
  if (count <= 0) return null;
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className={cn(
        'h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-highlight px-1',
        className,
      )}
    >
      <Text allowFontScaling={false} className="text-2xs font-semibold text-highlight-foreground">
        {formatCount(count, max, atLeast)}
      </Text>
    </View>
  );
}
