import { Image } from 'expo-image';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { Icon } from '../atoms';

/** One image of the gallery — `uri` may be a signed URL that expires (load error → placeholder). */
export type TMediaGalleryItem = { key: string; uri: string };

export type TMediaGalleryProps = {
  items: readonly TMediaGalleryItem[];
  /** Read with the position, e.g. "Ảnh sản phẩm". */
  accessibilityLabel: string;
  className?: string;
};

/** Product images: swipe one by one (4:3), "2 / 5" counter. No image → placeholder. */
export function MediaGallery({ items, accessibilityLabel, className }: TMediaGalleryProps) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View onLayout={onLayout} className={cn('aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface', className)}>
      {items.length === 0 ? (
        <Placeholder label="Chưa có ảnh" />
      ) : (
        width > 0 && (
          <>
            <FlatList
              data={items}
              keyExtractor={(item) => item.key}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollEnd}
              getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
              renderItem={({ item, index: i }) => (
                <GalleryImage
                  uri={item.uri}
                  width={width}
                  accessibilityLabel={`${accessibilityLabel} ${i + 1} / ${items.length}`}
                />
              )}
            />
            {items.length > 1 && (
              <View className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5">
                <Text className={TEXT.labelMedium}>
                  {Math.min(index, items.length - 1) + 1} / {items.length}
                </Text>
              </View>
            )}
          </>
        )
      )}
    </View>
  );
}

function GalleryImage({ uri, width, accessibilityLabel }: { uri: string; width: number; accessibilityLabel: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={{ width }} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} className="h-full">
      {failed ? (
        <Placeholder label="Không tải được ảnh" />
      ) : (
        <Image
          source={{ uri }}
          contentFit="cover"
          transition={150}
          onError={() => setFailed(true)}
          // expo-image has no NativeWind interop → plain style.
          style={StyleSheet.absoluteFill}
        />
      )}
    </View>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-1">
      <Icon name="image-outline" size="lg" color="mutedForeground" />
      <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>{label}</Text>
    </View>
  );
}
