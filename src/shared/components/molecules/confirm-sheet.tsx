import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppSheet, type TAppSheetProps } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { Button } from '../atoms';

export type TConfirmSheetProps = {
  /** From `useAppSheet()` of the opener. */
  sheetRef: TAppSheetProps['sheetRef'];
  onClose: () => void;
  title: string;
  description?: string;
  /** Label of the confirm button, e.g. "Xoá". */
  confirmLabel: string;
  /** The caller runs the action and closes the sheet on success. */
  onConfirm: () => void;
  /** `destructive` (default) for delete-like actions. */
  tone?: 'destructive' | 'normal';
  /** Action running: spinner on confirm, both buttons disabled. */
  loading?: boolean;
  /** Failure of the action, shown above the buttons. */
  error?: string;
  onDismiss?: () => void;
};

/** Asks before an irreversible action (delete product): title, description, Huỷ + confirm. Same role as web ConfirmDialog. */
export function ConfirmSheet({
  sheetRef,
  onClose,
  title,
  description,
  confirmLabel,
  onConfirm,
  tone = 'destructive',
  loading = false,
  error,
  onDismiss,
}: TConfirmSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <AppSheet sheetRef={sheetRef} accessibilityLabel={title} onDismiss={onDismiss}>
      <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-3 px-4 pt-2">
        <Text accessibilityRole="header" className={TEXT.titleMedium}>
          {title}
        </Text>
        {description && <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>{description}</Text>}
        {error && (
          <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodySmall, 'text-destructive')}>
            {error}
          </Text>
        )}
        <View className="mt-2 flex-row gap-3">
          <Button label="Huỷ" variant="outline" disabled={loading} onPress={onClose} className="flex-1" />
          <Button label={confirmLabel} variant={tone} loading={loading} onPress={onConfirm} className="flex-1" />
        </View>
      </View>
    </AppSheet>
  );
}
