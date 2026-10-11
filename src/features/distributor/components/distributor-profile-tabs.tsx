import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSession } from '@/features/auth';
import { ShopReviewsPanel } from '@/features/review';
import { SegmentedControl, type TSegmentedOption } from '@/shared/components/molecules';
import { cn } from '@/shared/lib/utils';
import { useDistributorProfile } from '../hooks/use-distributor-profile';
import { DistributorProductsTab } from './distributor-products-tab';
import { DistributorProfileActions } from './distributor-profile-actions';
import { DistributorProfileInfo } from './distributor-profile-info';

type TProfileTab = 'products' | 'reviews';

const TABS: readonly TSegmentedOption<TProfileTab>[] = [
  { value: 'products', label: 'Sản Phẩm' },
  { value: 'reviews', label: 'Đánh giá' },
];

export type TDistributorProfileTabsProps = { distributorId: string; className?: string };

/**
 * The profile body (ui-ux.md §7): ONE list whose header is the info + tabs Sản Phẩm | Đánh giá (default Sản Phẩm), then
 * the active tab. Sản Phẩm = product grid (infinite, owner adds products). Đánh giá = shop rating + reviews (infinite).
 * Profile not loaded / not found → only the info part (its own loading / error).
 */
export function DistributorProfileTabs({ distributorId, className }: TDistributorProfileTabsProps) {
  const [tab, setTab] = useState<TProfileTab>('products');
  const session = useSession();
  const { isSuccess } = useDistributorProfile(distributorId);

  const header = (
    <View className="gap-6 px-4 pb-2 pt-6">
      <DistributorProfileInfo distributorId={distributorId} actions={<DistributorProfileActions distributorId={distributorId} />} />
      {isSuccess && (
        <SegmentedControl options={TABS} value={tab} onChange={setTab} accessibilityLabel="Nội dung của shop" />
      )}
    </View>
  );

  if (!isSuccess) {
    return (
      <ScrollView className={cn('flex-1', className)} contentContainerClassName="grow">
        {header}
      </ScrollView>
    );
  }

  if (tab === 'reviews') {
    return (
      <ShopReviewsPanel distributorId={distributorId} currentUserId={session.user?.id} header={header} className={className} />
    );
  }

  return <DistributorProductsTab distributorId={distributorId} header={header} className={className} />;
}
