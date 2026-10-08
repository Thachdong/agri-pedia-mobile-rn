import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/shared/components/atoms';
import { MapPicker } from '@/shared/components/organisms';
import { AppSheet, type TAppSheetProps } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import type { TGeoPoint } from '@/shared/types';
import { useCurrentPosition } from '../hooks/use-current-position';

export type TLocationPickerSheetProps = {
  sheetRef: TAppSheetProps['sheetRef'];
  /** Position when the sheet opens (draft starts from it). */
  value: TGeoPoint | null;
  onConfirm: (point: TGeoPoint) => void;
  onCancel: () => void;
};

/** Content is mounted on each open, so the draft restarts from `value`; nothing changes until "Xác nhận". */
function LocationPickerContent({ value, onConfirm, onCancel }: Omit<TLocationPickerSheetProps, 'sheetRef'>) {
  const currentPosition = useCurrentPosition();
  const [draft, setDraft] = useState<TGeoPoint | null>(value);
  const [focus, setFocus] = useState<TGeoPoint | null>(null);

  const pickCurrentPosition = async () => {
    const point = await currentPosition.request();
    if (!point) return;
    setDraft(point);
    setFocus(point);
  };

  return (
    <View className="gap-3 px-4 pb-6 pt-1">
      <View className="gap-1">
        <Text accessibilityRole="header" className={TEXT.titleMedium}>
          Chọn vị trí trên bản đồ
        </Text>
        <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
          Chạm lên bản đồ để đặt vị trí, kéo ghim để chỉnh lại.
        </Text>
      </View>

      <MapPicker value={draft} onChange={setDraft} focus={focus} className="h-80" />

      <Button
        label="Vị trí hiện tại"
        variant="ghost"
        size="sm"
        loading={currentPosition.isLoading}
        onPress={pickCurrentPosition}
        className="self-start"
      />
      {currentPosition.error && (
        <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodySmall, 'text-destructive')}>
          {currentPosition.error}
        </Text>
      )}

      <View className="flex-row gap-3">
        <Button label="Huỷ" variant="outline" onPress={onCancel} className="flex-1" />
        <Button label="Xác nhận" disabled={!draft} onPress={() => draft && onConfirm(draft)} className="flex-1" />
      </View>
    </View>
  );
}

/** M-sheet: pick the address coordinates on the map (drag on the map doesn't close the sheet; the handle does). */
export function LocationPickerSheet({ sheetRef, ...props }: TLocationPickerSheetProps) {
  return (
    <AppSheet sheetRef={sheetRef} contentPanningEnabled={false} accessibilityLabel="Chọn vị trí trên bản đồ">
      <LocationPickerContent {...props} />
    </AppSheet>
  );
}
