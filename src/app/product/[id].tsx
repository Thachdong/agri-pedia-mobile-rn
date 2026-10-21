import { useLocalSearchParams } from 'expo-router';
import { ProductDetailView } from '@/features/product';
import { ScreenHeader } from '@/shared/components/organisms';
import { ScreenLayout } from '@/shared/components/templates';

/**
 * Product detail "/product/<id>" — public. On mobile a page replaces the web's dialog M3 (ui-ux.md §7): images, info,
 * owner Sửa / Xoá, FARMER Đánh giá sản phẩm (guest → M1), rating + reviews. Opened from the profile grid and REVIEW
 * notifications.
 */
export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenLayout header={<ScreenHeader title="Chi tiết sản phẩm" />}>
      <ProductDetailView key={id} productId={id} />
    </ScreenLayout>
  );
}
