import { Image } from 'expo-image';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/shared/components/atoms';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { formatPrice } from '@/shared/utils';
import { PRODUCT_UNIT_LABELS } from '../constants/product.constants';
import type { TDistributorProduct } from '../types/product.types';

export type TProductCardProps = {
  product: TDistributorProduct;
  onPress: (productId: string) => void;
  className?: string;
};

/**
 * Card of the "Sản Phẩm" grid (image-5): thumbnail, name, price / unit, quantity. The list API has no category /
 * description → shown on the detail page only (same as web).
 */
export const ProductCard = memo(function ProductCard({ product, onPress, className }: TProductCardProps) {
  const { id, name, price, unit, quantity, thumbnail } = product;
  const [failedThumbnail, setFailedThumbnail] = useState<string | null>(null);
  const showImage = !!thumbnail && failedThumbnail !== thumbnail;
  const unitLabel = PRODUCT_UNIT_LABELS[unit];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${formatPrice(price)} / ${unitLabel}, số lượng ${quantity}`}
      onPress={() => onPress(id)}
      className={cn(
        'flex-1 overflow-hidden rounded-lg border border-border-subtle bg-background active:opacity-80',
        className,
      )}
    >
      <View className="aspect-[4/3] w-full items-center justify-center bg-surface">
        {showImage ? (
          <Image
            source={{ uri: thumbnail }}
            contentFit="cover"
            transition={150}
            onError={() => setFailedThumbnail(thumbnail)}
            // expo-image has no NativeWind interop → plain style.
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <Icon name="image-outline" size="lg" color="mutedForeground" />
        )}
      </View>
      <View className="gap-1 p-2">
        <Text numberOfLines={2} className={cn(TEXT.titleSmall, 'text-foreground')}>
          {name}
        </Text>
        <Text numberOfLines={1} className={cn(TEXT.labelLarge, 'text-highlight')}>
          {formatPrice(price)} / {unitLabel}
        </Text>
        <Text numberOfLines={1} className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
          Số lượng: {quantity}
        </Text>
      </View>
    </Pressable>
  );
});
