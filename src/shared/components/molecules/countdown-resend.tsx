import { Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { Button } from '../atoms';

const formatMmSs = (remainingMs: number) => {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export type TCountdownResendProps = {
  /** Time left before resend is allowed (from `useCountdown`); 0 → countdown hidden, resend enabled. */
  remainingMs: number;
  onResend: () => void;
  /** Resend request in flight. */
  isSending?: boolean;
  /** Extra lock, e.g. while the form is submitting. */
  disabled?: boolean;
  className?: string;
};

/**
 * "Chưa nhận được code? Gửi lại" + mm:ss countdown under it (wireframe /auth/activate, reused by /auth/change-password).
 * Resend disabled while counting or sending.
 */
export function CountdownResend({ remainingMs, onResend, isSending = false, disabled, className }: TCountdownResendProps) {
  const isCounting = remainingMs > 0;

  return (
    <View className={cn('items-center', className)}>
      <View className="flex-row flex-wrap items-center justify-center gap-1">
        <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>Chưa nhận được code?</Text>
        <Button
          label="Gửi lại"
          variant="link"
          size="sm"
          className="px-1"
          onPress={onResend}
          loading={isSending}
          disabled={disabled || isCounting}
          accessibilityHint={isCounting ? `Có thể gửi lại sau ${formatMmSs(remainingMs)}` : undefined}
        />
      </View>
      {isCounting && (
        <Text
          accessibilityLabel={`Có thể gửi lại sau ${formatMmSs(remainingMs)}`}
          className={cn(TEXT.titleSmall, 'tabular-nums')}
        >
          {formatMmSs(remainingMs)}
        </Text>
      )}
    </View>
  );
}
