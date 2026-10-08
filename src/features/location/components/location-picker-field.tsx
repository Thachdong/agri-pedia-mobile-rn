import { Text, View } from 'react-native';
import { Button } from '@/shared/components/atoms';
import { useAppSheet } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import type { TGeoPoint } from '@/shared/types';
import { useCurrentPosition } from '../hooks/use-current-position';
import { LocationPickerSheet } from './location-picker-sheet';

export type TLocationPickerFieldProps = {
  label?: string;
  value: TGeoPoint | null;
  onChange: (point: TGeoPoint) => void;
  /** Validation message from the form (e.g. no position picked). */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

const formatPoint = ({ lat, long }: TGeoPoint) => `${lat.toFixed(6)}, ${long.toFixed(6)}`;

/** Coordinates of an address: pick on the map (sheet) or take the current position. Denied permission → map still works. */
export function LocationPickerField({
  label = 'Vị trí trên bản đồ',
  value,
  onChange,
  error,
  required,
  disabled = false,
  className,
}: TLocationPickerFieldProps) {
  const sheet = useAppSheet();
  const currentPosition = useCurrentPosition();
  const message = error ?? currentPosition.error;

  const applyCurrentPosition = async () => {
    const point = await currentPosition.request();
    if (point) onChange(point);
  };

  return (
    <View className={cn('gap-1.5', className)}>
      <Text className={cn(TEXT.labelLarge, 'text-foreground')}>
        {label}
        {required && <Text className="text-destructive"> *</Text>}
      </Text>
      <View
        accessibilityLiveRegion="polite"
        className={cn(
          'min-h-12 justify-center rounded-lg border border-input bg-surface px-3',
          error && 'border-destructive',
        )}
      >
        <Text className={cn(TEXT.bodyLarge, !value && 'text-muted-foreground')}>
          {value ? formatPoint(value) : 'Chưa chọn vị trí'}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        <Button
          label="Chọn trên bản đồ"
          variant="outline"
          size="sm"
          disabled={disabled}
          onPress={sheet.open}
          className="flex-1"
        />
        <Button
          label="Dùng vị trí hiện tại"
          variant="ghost"
          size="sm"
          disabled={disabled}
          loading={currentPosition.isLoading}
          onPress={applyCurrentPosition}
          className="flex-1"
        />
      </View>
      {message && (
        <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodySmall, 'text-destructive')}>
          {message}
        </Text>
      )}

      <LocationPickerSheet
        sheetRef={sheet.ref}
        value={value}
        onConfirm={(point) => {
          onChange(point);
          sheet.close();
        }}
        onCancel={sheet.close}
      />
    </View>
  );
}
