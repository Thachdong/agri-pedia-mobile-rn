import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { AppMap, MAP_ZOOM, type TAppMapHandle } from '@/shared/lib/map';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import type { TGeoPoint } from '@/shared/types';

const MARKER_ID = 'picked';

export type TMapPickerProps = {
  /** Picked position (marker). `null` = nothing picked yet. */
  value: TGeoPoint | null;
  /** Tap on the map or drag the marker. */
  onChange: (point: TGeoPoint) => void;
  /** Point to fly to (e.g. current position) — does not change `value`. Same as web. */
  focus?: TGeoPoint | null;
  className?: string;
  accessibilityLabel?: string;
};

/** Pick one coordinate on the OSM map: tap to place the marker, drag it to adjust. Opens on `value`, else on VN. */
export function MapPicker({ value, onChange, focus, className, accessibilityLabel = 'Bản đồ chọn vị trí' }: TMapPickerProps) {
  const mapRef = useRef<TAppMapHandle>(null);

  useEffect(() => {
    if (focus) mapRef.current?.animateTo(focus, MAP_ZOOM.street);
  }, [focus]);

  return (
    <View className={cn('gap-2', className)}>
      <AppMap
        ref={mapRef}
        initialCenter={value ?? undefined}
        initialLatitudeDelta={value ? MAP_ZOOM.street : MAP_ZOOM.country}
        markers={value ? [{ id: MARKER_ID, point: value, draggable: true }] : []}
        onPress={onChange}
        onMarkerDragEnd={(_, point) => onChange(point)}
        accessibilityLabel={accessibilityLabel}
        className="flex-1 rounded-lg border border-border-subtle"
      />
      <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
        {value
          ? `Đã chọn: ${value.lat.toFixed(5)}, ${value.long.toFixed(5)} — kéo ghim để chỉnh`
          : 'Chạm vào bản đồ để chọn vị trí'}
      </Text>
    </View>
  );
}
