import { useLocalSearchParams } from 'expo-router';
import { EmptyState } from '@/shared/components/molecules';
import { ScreenHeader } from '@/shared/components/organisms';
import { ScreenLayout } from '@/shared/components/templates';

/**
 * Product detail "/product/<id>" — public. On mobile a page replaces the web's dialog M3 (ui-ux.md §7).
 * Placeholder until the product feature: opened from REVIEW notifications.
 */
export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenLayout header={<ScreenHeader title="Chi tiết sản phẩm" />}>
      <EmptyState icon="cube-outline" title="Đang phát triển" description={`Mã sản phẩm: ${id}`} />
    </ScreenLayout>
  );
}
