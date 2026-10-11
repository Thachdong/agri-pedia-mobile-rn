import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Button } from '@/shared/components/atoms';
import { EmptyState, InfoTable, MediaGallery, type TInfoTableItem } from '@/shared/components/molecules';
import { ROUTES } from '@/shared/constants';
import { getErrorMessage } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import { formatPrice } from '@/shared/utils';
import { PRODUCT_STATUS_LABELS, PRODUCT_UNIT_LABELS } from '../constants/product.constants';
import { useCategories } from '../hooks/use-categories';
import { useProductDetail } from '../hooks/use-product-detail';
import { isProductNotFound } from '../utils/product-error.util';

export type TProductDetailInfoProps = {
  productId: string;
  /** The viewer owns the product → status shown when it isn't on sale. */
  isOwner?: boolean;
  /** Buttons under the title (Sửa + Xoá | Đánh giá sản phẩm). */
  actions?: ReactNode;
  className?: string;
};

/**
 * Product detail (M3 — a page on mobile): images, name, price / unit, actions, then Số lượng, Danh mục, Nhà phân phối
 * (link to the shop), Trạng thái (owner, when not on sale), Mô tả. Loading, error + retry, not found (deleted).
 */
export function ProductDetailInfo({ productId, isOwner = false, actions, className }: TProductDetailInfoProps) {
  const { data: product, isPending, isError, error, refetch } = useProductDetail(productId);
  const { data: categories } = useCategories();

  if (isPending) {
    return (
      <View className={cn('items-center py-8', className)} accessibilityLabel="Đang tải sản phẩm">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    const notFound = isProductNotFound(error);
    return (
      <EmptyState
        icon={notFound ? 'cube-outline' : 'alert-circle-outline'}
        title={notFound ? 'Sản phẩm không tồn tại' : 'Không tải được sản phẩm'}
        description={notFound ? 'Sản phẩm đã bị xoá hoặc không còn tồn tại.' : getErrorMessage(error)}
        action={notFound ? undefined : <Button label="Thử lại" variant="outline" size="sm" onPress={() => void refetch()} />}
        className={className}
      />
    );
  }

  const unitLabel = PRODUCT_UNIT_LABELS[product.unit];
  const images = product.media
    .filter((media) => media.type === 'IMAGE')
    .map((media) => ({ key: media.id, uri: media.url }));
  const rows: TInfoTableItem[] = [
    { id: 'quantity', label: 'Số lượng', value: `${product.quantity} ${unitLabel}` },
    {
      id: 'category',
      label: 'Danh mục',
      value: categories?.find((category) => category.id === product.categoryId)?.name,
    },
    {
      id: 'distributor',
      label: 'Nhà phân phối',
      value: (
        <Link href={ROUTES.profile(product.distributorId)} asChild>
          <Pressable accessibilityRole="link" hitSlop={8} className="min-h-11 justify-center">
            <Text className={cn(TEXT.bodyMedium, 'text-highlight underline')}>Xem trang nhà phân phối</Text>
          </Pressable>
        </Link>
      ),
    },
    ...(isOwner && product.status !== 'ACTIVE'
      ? [{ id: 'status', label: 'Trạng thái', value: PRODUCT_STATUS_LABELS[product.status] }]
      : []),
    { id: 'description', label: 'Mô tả', value: product.description },
  ];

  return (
    <View className={cn('gap-4', className)}>
      <MediaGallery items={images} accessibilityLabel={`Ảnh ${product.name}`} />
      <View className="gap-1">
        <Text accessibilityRole="header" className={TEXT.titleLarge}>
          {product.name}
        </Text>
        <Text className={cn(TEXT.titleMedium, 'text-highlight')}>
          {formatPrice(product.price)} / {unitLabel}
        </Text>
      </View>
      {actions}
      <InfoTable items={rows} />
    </View>
  );
}
