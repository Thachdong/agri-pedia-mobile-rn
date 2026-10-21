import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { Icon, IconButton } from '../atoms';

/** A thumbnail: a current image (signed URL) or a picked local file (uri). */
export type TMultiImageItem = { key: string; uri: string };

export type TMultiImagePickerFieldProps = {
  label: string;
  /** Saved images still kept. */
  existing: readonly TMultiImageItem[];
  /** Newly picked, uploaded on save. */
  picked: readonly TMultiImageItem[];
  onRemoveExisting: (key: string) => void;
  onRemovePicked: (key: string) => void;
  /** Opens the picker — the caller picks (device lib, up to the free slots) and adds to `picked`. */
  onAdd: () => void;
  /** Total images allowed (existing + picked). */
  max: number;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
};

/** Several images (product): grid of thumbnails, each removable, "+" tile while slots remain, count and error. */
export function MultiImagePickerField({
  label,
  existing,
  picked,
  onRemoveExisting,
  onRemovePicked,
  onAdd,
  max,
  hint,
  error,
  disabled = false,
  className,
}: TMultiImagePickerFieldProps) {
  const total = existing.length + picked.length;

  return (
    <View className={cn('gap-1.5', className)}>
      <View className="flex-row items-center justify-between">
        <Text className={cn(TEXT.labelLarge, 'text-foreground')}>{label}</Text>
        <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
          {total} / {max}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {existing.map((item, index) => (
          <Thumbnail
            key={item.key}
            uri={item.uri}
            label={`Ảnh ${index + 1}`}
            disabled={disabled}
            onRemove={() => onRemoveExisting(item.key)}
          />
        ))}
        {picked.map((item, index) => (
          <Thumbnail
            key={item.key}
            uri={item.uri}
            label={`Ảnh ${existing.length + index + 1}`}
            disabled={disabled}
            onRemove={() => onRemovePicked(item.key)}
          />
        ))}
        {total < max && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Thêm ${label.toLocaleLowerCase('vi-VN')}`}
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onAdd}
            className={cn(
              'h-24 w-24 items-center justify-center gap-1 rounded-lg border border-dashed active:bg-surface',
              error ? 'border-destructive' : 'border-border-subtle',
              disabled && 'opacity-50',
            )}
          >
            <Icon name="add" color="mutedForeground" />
            <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>Thêm ảnh</Text>
          </Pressable>
        )}
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

type TThumbnailProps = { uri: string; label: string; disabled: boolean; onRemove: () => void };

function Thumbnail({ uri, label, disabled, onRemove }: TThumbnailProps) {
  // Current images are signed URLs that expire → icon instead of a blank tile.
  const [failed, setFailed] = useState(false);
  return (
    <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-surface">
      {failed ? (
        <View accessible accessibilityRole="image" accessibilityLabel={label}>
          <Icon name="image-outline" color="mutedForeground" />
        </View>
      ) : (
        <Image
          source={{ uri }}
          contentFit="cover"
          accessibilityLabel={label}
          onError={() => setFailed(true)}
          // expo-image has no NativeWind interop → plain style.
          style={StyleSheet.absoluteFill}
        />
      )}
      <IconButton
        icon="close-circle"
        size="md"
        accessibilityLabel={`Xoá ${label.toLocaleLowerCase('vi-VN')}`}
        disabled={disabled}
        onPress={onRemove}
        className="absolute right-0 top-0 bg-background/70"
      />
    </View>
  );
}
