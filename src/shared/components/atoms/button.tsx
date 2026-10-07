import { cva, type VariantProps } from 'class-variance-authority';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { colors } from '@/shared/theme';

const buttonVariants = cva('flex-row items-center justify-center gap-2 rounded-lg active:opacity-80', {
  variants: {
    /** `normal` = main action (btn-normal), `highlight` = emphasised action — same names as web. */
    variant: {
      normal: 'bg-primary',
      highlight: 'bg-highlight',
      outline: 'border border-border-subtle bg-background',
      ghost: 'bg-transparent',
      link: 'bg-transparent',
    },
    size: {
      default: 'min-h-12 px-4',
      sm: 'min-h-11 px-3',
    },
    disabled: { true: 'opacity-50' },
  },
  defaultVariants: { variant: 'normal', size: 'default' },
});

const labelVariants = cva('text-center text-sm font-semibold', {
  variants: {
    variant: {
      normal: 'text-primary-foreground',
      highlight: 'text-highlight-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
      link: 'text-highlight underline',
    },
  },
  defaultVariants: { variant: 'normal' },
});

const SPINNER_COLOR = {
  normal: colors.primaryForeground,
  highlight: colors.highlightForeground,
  outline: colors.foreground,
  ghost: colors.foreground,
  link: colors.highlight,
} as const;

export type TButtonProps = Omit<React.ComponentProps<typeof Pressable>, 'children' | 'disabled'> &
  Omit<VariantProps<typeof buttonVariants>, 'disabled'> & {
    label: string;
    /** Spinner + disabled + busy state. */
    loading?: boolean;
    disabled?: boolean;
    className?: string;
  };

export function Button({
  label,
  variant = 'normal',
  size,
  loading = false,
  disabled = false,
  className,
  accessibilityLabel,
  ...props
}: TButtonProps) {
  const isDisabled = disabled || loading;
  const tone = variant ?? 'normal'; // cva types allow null

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={size === 'sm' ? 4 : undefined}
      className={cn(buttonVariants({ variant: tone, size, disabled: isDisabled }), className)}
      {...props}
    >
      {loading && <ActivityIndicator size="small" color={SPINNER_COLOR[tone]} />}
      <Text className={labelVariants({ variant: tone })}>{label}</Text>
    </Pressable>
  );
}
