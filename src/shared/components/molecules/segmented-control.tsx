import { Pressable, Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';

export type TSegmentedOption<T extends string> = { value: T; label: string };

export type TSegmentedControlProps<T extends string> = {
  options: readonly TSegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Read by screen readers for the whole group, e.g. "Đăng ký bằng". */
  accessibilityLabel: string;
  disabled?: boolean;
  className?: string;
};

/** Tabs of one choice (EMAIL | PHONE). Pressing the selected option does nothing. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
  className,
}: TSegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className={cn('flex-row self-center rounded-lg border border-border-subtle bg-surface p-1', className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => {
              if (!selected) onChange(option.value);
            }}
            className={cn(
              'min-h-11 min-w-24 items-center justify-center rounded-md px-4',
              selected && 'bg-primary',
              disabled && 'opacity-50',
            )}
          >
            <Text className={cn(TEXT.labelLarge, selected ? 'text-primary-foreground' : 'text-foreground')}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
