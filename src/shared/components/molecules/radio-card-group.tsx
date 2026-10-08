import { Pressable, Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';

export type TRadioCardOption<T extends string> = { value: T; label: string; description?: string };

export type TRadioCardGroupProps<T extends string> = {
  label: string;
  options: readonly TRadioCardOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
};

/** One choice among a few options shown as cards with a description (role FARMER | DISTRIBUTOR). */
export function RadioCardGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  required,
  error,
  disabled = false,
  className,
}: TRadioCardGroupProps<T>) {
  return (
    <View className={cn('gap-1.5', className)}>
      <Text className={cn(TEXT.labelLarge, 'text-foreground')}>
        {label}
        {required && <Text className="text-destructive"> *</Text>}
      </Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} className="gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.description ? `${option.label}. ${option.description}` : option.label}
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              className={cn(
                'min-h-12 flex-row items-center gap-3 rounded-lg border bg-background px-3 py-2.5',
                selected ? 'border-primary bg-surface' : 'border-border-subtle',
                error && !selected && 'border-destructive',
                disabled && 'opacity-50',
              )}
            >
              <View
                className={cn(
                  'h-5 w-5 items-center justify-center rounded-full border-2',
                  selected ? 'border-primary' : 'border-input',
                )}
              >
                {selected && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </View>
              <View className="flex-1 gap-0.5">
                <Text className={TEXT.titleSmall}>{option.label}</Text>
                {option.description && (
                  <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>{option.description}</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
      {error && (
        <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodySmall, 'text-destructive')}>
          {error}
        </Text>
      )}
    </View>
  );
}
