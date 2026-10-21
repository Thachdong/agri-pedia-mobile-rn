import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from '@/shared/components/atoms';
import { SelectField, type TSelectOption } from '@/shared/components/molecules';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import type { TPlantPart } from '../types/diagnosis.types';

export type TDiagnosisImageSlotProps = {
  uri: string;
  /** 0-based position — "Ảnh 1", "Ảnh 2"... */
  index: number;
  plantPart: TPlantPart | '';
  /** The crop's parts (GET /knowledge/crops `plantParts`), in dropdown order. */
  plantPartOptions: readonly TSelectOption<TPlantPart>[];
  onPlantPartChange: (plantPart: TPlantPart) => void;
  onRemove: () => void;
  /** Image-level error (not decodable, rejected by the server). */
  error?: string;
  disabled?: boolean;
  className?: string;
};

/** One photo of the diagnosis form: thumbnail + remove, the plant part it shows (optional), its error. */
export function DiagnosisImageSlot({
  uri,
  index,
  plantPart,
  plantPartOptions,
  onPlantPartChange,
  onRemove,
  error,
  disabled = false,
  className,
}: TDiagnosisImageSlotProps) {
  const label = `Ảnh ${index + 1}`;
  return (
    <View className={cn('gap-1', className)}>
      <View className="flex-row items-start gap-3">
        <View
          className={cn(
            'h-24 w-24 overflow-hidden rounded-lg border bg-surface',
            error ? 'border-destructive' : 'border-border-subtle',
          )}
        >
          <Image
            source={{ uri }}
            contentFit="cover"
            accessibilityLabel={label}
            // expo-image has no NativeWind interop → plain style.
            style={StyleSheet.absoluteFill}
          />
        </View>
        <SelectField
          label={`Bộ phận trong ${label.toLocaleLowerCase('vi-VN')}`}
          options={plantPartOptions}
          value={plantPart || null}
          onChange={onPlantPartChange}
          placeholder="Không rõ (AI tự nhận diện)"
          disabled={disabled}
          className="flex-1"
        />
        <IconButton
          icon="trash-outline"
          accessibilityLabel={`Xoá ${label.toLocaleLowerCase('vi-VN')}`}
          disabled={disabled}
          onPress={onRemove}
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
