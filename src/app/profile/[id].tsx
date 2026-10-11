import { useLocalSearchParams } from 'expo-router';
import { DistributorProfileTabs } from '@/features/distributor';
import { AccountHeaderActions } from '@/features/user';
import { SiteHeader } from '@/shared/components/organisms';
import { ProfileLayout } from '@/shared/components/templates';

/**
 * Distributor profile "/profile/<id>" (ui-ux.md §7, image-5 / image-6) — public. Header as "/", then one list:
 * info + buttons (Chỉnh sửa | Chat + Đánh giá) + tabs Sản Phẩm | Đánh giá.
 */
export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ProfileLayout
      header={<SiteHeader actions={<AccountHeaderActions />} />}
      body={<DistributorProfileTabs key={id} distributorId={id} />}
    />
  );
}
