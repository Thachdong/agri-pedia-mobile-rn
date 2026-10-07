import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { Input, type TInputProps } from '../atoms';

export type TFormInputProps = Omit<TInputProps, 'invalid'> & {
  label: string;
  required?: boolean;
  /** Help text under the input (hidden while an error is shown). */
  hint?: string;
  /** Translated message (schema / server). */
  error?: string;
  /** Password field: hides the text and adds a "Hiện / Ẩn" toggle. */
  secureToggle?: boolean;
  containerClassName?: string;
};

/** Label + Input + hint/error — the field of every form (bind with `FormField` from `@/shared/lib/form`). */
export function FormInput({
  label,
  required,
  hint,
  error,
  secureToggle,
  containerClassName,
  className,
  accessibilityLabel,
  secureTextEntry,
  ...inputProps
}: TFormInputProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      <Text className={cn(TEXT.labelLarge, 'text-foreground')}>
        {label}
        {required && <Text className="text-destructive"> *</Text>}
      </Text>
      <View className="justify-center">
        <Input
          {...inputProps}
          invalid={Boolean(error)}
          secureTextEntry={secureToggle ? !revealed : secureTextEntry}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={error ?? hint}
          className={cn(secureToggle && 'pr-16', className)}
        />
        {secureToggle && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            onPress={() => setRevealed((value) => !value)}
            hitSlop={8}
            className="absolute right-1 min-h-11 justify-center px-3"
          >
            <Text className={cn(TEXT.labelMedium, 'text-highlight')}>{revealed ? 'Ẩn' : 'Hiện'}</Text>
          </Pressable>
        )}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodySmall, 'text-destructive')}>
          {error}
        </Text>
      ) : hint ? (
        <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>{hint}</Text>
      ) : null}
    </View>
  );
}
