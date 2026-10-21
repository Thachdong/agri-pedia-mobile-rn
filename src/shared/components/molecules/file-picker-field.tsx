import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { Button, Icon } from '../atoms';

/** What the field shows for a picked file — the device picker's file fits. */
export type TFilePickerValue = { uri: string; name: string; mimeType: string };

export type TFilePickerFieldProps = {
  label: string;
  /** Picked, not saved yet; null → `currentLabel` (or "Chưa chọn tệp"). */
  value: TFilePickerValue | null;
  /** Opens the picker — the caller picks (device lib) and sets `value`. */
  onPick: () => void;
  /** Drops the picked file (back to the current one). */
  onClear: () => void;
  /** What is saved now (e.g. "Đã có giấy phép") when nothing new is picked. */
  currentLabel?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
};

/** Pick one file (avatar, business license): image → thumbnail, other → icon + name; change / remove; error under it. */
export function FilePickerField({
  label,
  value,
  onPick,
  onClear,
  currentLabel,
  hint,
  error,
  disabled = false,
  className,
}: TFilePickerFieldProps) {
  const isImage = value?.mimeType.startsWith('image/') ?? false;

  return (
    <View className={cn('gap-1.5', className)}>
      <Text className={cn(TEXT.labelLarge, 'text-foreground')}>{label}</Text>
      <View
        className={cn(
          'min-h-14 flex-row items-center gap-3 rounded-lg border bg-background px-3 py-2',
          error ? 'border-destructive' : 'border-border-subtle',
        )}
      >
        {value && isImage ? (
          <Image source={{ uri: value.uri }} contentFit="cover" style={styles.thumbnail} accessibilityIgnoresInvertColors />
        ) : (
          <Icon name={value ? 'document-outline' : 'cloud-upload-outline'} color="mutedForeground" />
        )}
        <Text numberOfLines={1} className={cn(TEXT.bodySmall, 'flex-1', value ? 'text-foreground' : 'text-muted-foreground')}>
          {value?.name ?? currentLabel ?? 'Chưa chọn tệp'}
        </Text>
        {value && (
          <Button label="Bỏ" variant="ghost" size="sm" disabled={disabled} onPress={onClear} accessibilityLabel={`Bỏ ${label}`} />
        )}
        <Button
          label={value || currentLabel ? 'Đổi' : 'Chọn'}
          variant="outline"
          size="sm"
          disabled={disabled}
          onPress={onPick}
          accessibilityLabel={`Chọn ${label}`}
        />
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodySmall, 'text-destructive')}>
          {error}
        </Text>
      ) : (
        hint && <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>{hint}</Text>
      )}
    </View>
  );
}

// expo-image has no NativeWind interop → plain style.
const styles = StyleSheet.create({ thumbnail: { width: 40, height: 40, borderRadius: 6 } });
