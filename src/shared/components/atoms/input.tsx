import { useState, type Ref } from 'react';
import { TextInput } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { colors } from '@/shared/theme';

export type TInputProps = React.ComponentProps<typeof TextInput> & {
  ref?: Ref<TextInput>;
  /** Error state (red border); the message itself is rendered by the field molecule. */
  invalid?: boolean;
  className?: string;
};

/** Text input styled with tokens. `multiline` → textarea (bio). Focus border, error border, disabled look. */
export function Input({ ref, invalid, multiline, editable = true, className, onFocus, onBlur, ...props }: TInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      ref={ref}
      multiline={multiline}
      editable={editable}
      placeholderTextColor={colors.mutedForeground}
      textAlignVertical={multiline ? 'top' : 'center'}
      accessibilityState={{ disabled: !editable }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      className={cn(
        'min-h-12 rounded-lg border border-input bg-background px-3 text-base text-foreground',
        multiline && 'min-h-24 py-3',
        focused && 'border-ring',
        invalid && 'border-destructive',
        !editable && 'bg-muted opacity-60',
        className,
      )}
      {...props}
    />
  );
}
