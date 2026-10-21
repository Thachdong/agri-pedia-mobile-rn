import { cva, type VariantProps } from 'class-variance-authority';
import { Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';

const badgeVariants = cva('self-start rounded-md px-2 py-0.5', {
  variants: {
    /** Same tones as the web Badge. */
    tone: {
      neutral: 'bg-surface',
      success: 'bg-success-subtle',
      warning: 'bg-warning-subtle',
      highlight: 'bg-highlight-subtle',
      destructive: 'bg-destructive',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

const labelVariants = cva('text-xs font-medium', {
  variants: {
    tone: {
      neutral: 'text-foreground',
      success: 'text-success',
      warning: 'text-warning',
      highlight: 'text-highlight',
      destructive: 'text-destructive-foreground',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export type TBadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

export type TBadgeProps = {
  label: string;
  tone?: TBadgeTone;
  className?: string;
};

/** Small status label (confidence, image status, category). Not pressable. */
export function Badge({ label, tone = 'neutral', className }: TBadgeProps) {
  return (
    <View className={cn(badgeVariants({ tone }), className)}>
      <Text className={labelVariants({ tone })}>{label}</Text>
    </View>
  );
}
