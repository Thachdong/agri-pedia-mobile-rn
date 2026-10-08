import { useLocalSearchParams } from 'expo-router';
import { DistributorProfileInfo, DistributorProfileTabs } from '@/features/distributor';
import { AccountHeaderActions } from '@/features/user';
import { SiteHeader } from '@/shared/components/organisms';
import { ProfileLayout } from '@/shared/components/templates';

/**
 * Distributor profile "/profile/<id>" (ui-ux.md §7, image-5 / image-6) — public. Layout only: header as "/",
 * info (title, Chat hidden for the owner, info table) and tabs Sản Phẩm | Đánh giá without data yet.
 */
export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ProfileLayout
      header={<SiteHeader actions={<AccountHeaderActions />} />}
      info={<DistributorProfileInfo distributorId={id} />}
      tabs={<DistributorProfileTabs />}
    />
  );
}
