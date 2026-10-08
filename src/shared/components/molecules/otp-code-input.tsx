import { useState, type Ref } from 'react';
import { Text, TextInput, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';

const NON_DIGITS = /\D/g;

export type TOtpCodeInputProps = {
  ref?: Ref<TextInput>;
  label: string;
  value: string;
  onChangeText: (code: string) => void;
  /** Number of boxes (server OTP_LENGTH, default 6). */
  length?: number;
  /** Fired once all boxes are filled (typed, pasted or autofilled) — the caller focuses the submit button. */
  onComplete?: (code: string) => void;
  onBlur?: () => void;
  required?: boolean;
  /** Translated message (schema / server); red boxes when set. */
  error?: string;
  editable?: boolean;
  autoFocus?: boolean;
  className?: string;
};

/**
 * OTP code as N boxes. One hidden TextInput over the boxes holds the value, so SMS / email autofill
 * (`oneTimeCode` / `sms-otp`) and paste fill every box at once; the active box follows the cursor
 * (typing advances, backspace moves back). Digits only, extra input cut at `length`.
 */
export function OtpCodeInput({
  ref,
  label,
  value,
  onChangeText,
  length = 6,
  onComplete,
  onBlur,
  required,
  error,
  editable = true,
  autoFocus,
  className,
}: TOtpCodeInputProps) {
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  const change = (text: string) => {
    const code = text.replace(NON_DIGITS, '').slice(0, length);
    if (code === value) return;
    onChangeText(code);
    if (code.length === length) onComplete?.(code);
  };

  return (
    <View className={cn('gap-1.5', className)}>
      <Text className={cn(TEXT.labelLarge, 'text-foreground')}>
        {label}
        {required && <Text className="text-destructive"> *</Text>}
      </Text>
      <View className="relative flex-row gap-2">
        {Array.from({ length }, (_, index) => (
          <View
            key={index}
            className={cn(
              'h-12 flex-1 items-center justify-center rounded-lg border border-input bg-background',
              focused && index === activeIndex && 'border-ring',
              error && 'border-destructive',
              !editable && 'bg-muted opacity-60',
            )}
          >
            <Text className={cn(TEXT.titleLarge, 'text-foreground')}>{value[index] ?? ''}</Text>
          </View>
        ))}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={change}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          editable={editable}
          autoFocus={autoFocus}
          maxLength={length}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          caretHidden
          contextMenuHidden={false}
          accessibilityLabel={label}
          accessibilityHint={error ?? `Nhập ${length} chữ số`}
          accessibilityState={{ disabled: !editable }}
          className="absolute inset-0 text-transparent"
        />
      </View>
      {error && (
        <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodySmall, 'text-destructive')}>
          {error}
        </Text>
      )}
    </View>
  );
}
