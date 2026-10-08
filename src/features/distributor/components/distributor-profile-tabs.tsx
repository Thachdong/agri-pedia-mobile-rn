import { useState } from 'react';
import { View } from 'react-native';
import { EmptyState, SegmentedControl, type TSegmentedOption } from '@/shared/components/molecules';
import { cn } from '@/shared/lib/utils';

type TProfileTab = 'products' | 'reviews';

const TABS: readonly TSegmentedOption<TProfileTab>[] = [
  { value: 'products', label: 'Sản Phẩm' },
  { value: 'reviews', label: 'Đánh giá' },
];

export type TDistributorProfileTabsProps = { className?: string };

/**
 * Tabs under the profile info (ui-ux.md §7, image-5 / image-6): Sản Phẩm | Đánh giá, default Sản Phẩm.
 * Layout only — product grid and review list come with the product / review features.
 */
export function DistributorProfileTabs({ className }: TDistributorProfileTabsProps) {
  const [tab, setTab] = useState<TProfileTab>('products');

  return (
    <View className={cn('gap-4', className)}>
      <SegmentedControl options={TABS} value={tab} onChange={setTab} accessibilityLabel="Nội dung của shop" />
      {tab === 'products' ? (
        <EmptyState icon="cube-outline" title="Chưa có sản phẩm" />
      ) : (
        <EmptyState icon="star-outline" title="Chưa có đánh giá" />
      )}
    </View>
  );
}
