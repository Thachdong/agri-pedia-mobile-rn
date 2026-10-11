import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSession } from '@/features/auth';
import { ShopReviewsPanel } from '@/features/review';
import { EmptyState, SegmentedControl, type TSegmentedOption } from '@/shared/components/molecules';
import { cn } from '@/shared/lib/utils';
import { useDistributorProfile } from '../hooks/use-distributor-profile';
import { DistributorProfileActions } from './distributor-profile-actions';
import { DistributorProfileInfo } from './distributor-profile-info';

type TProfileTab = 'products' | 'reviews';

const TABS: readonly TSegmentedOption<TProfileTab>[] = [
  { value: 'products', label: 'Sản Phẩm' },
  { value: 'reviews', label: 'Đánh giá' },
];

const NO_ITEMS: readonly never[] = [];

export type TDistributorProfileTabsProps = { distributorId: string; className?: string };

/**
 * The profile body (ui-ux.md §7): ONE list whose header is the info + tabs Sản Phẩm | Đánh giá (default Sản Phẩm), then
 * the active tab. Đánh giá = shop rating + reviews (infinite). Sản Phẩm = placeholder until the product feature.
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

  if (isSuccess && tab === 'reviews') {
    return (
      <ShopReviewsPanel distributorId={distributorId} currentUserId={session.user?.id} header={header} className={className} />
    );
  }

  return (
    <FlatList
      data={NO_ITEMS}
      renderItem={null}
      ListHeaderComponent={header}
      ListEmptyComponent={isSuccess ? <EmptyState icon="cube-outline" title="Chưa có sản phẩm" /> : null}
      className={cn('flex-1', className)}
      contentContainerClassName="grow"
    />
  );
}
