import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { useProvinces } from '@/features/location';
import { InfiniteList, type TInfiniteListHandle } from '@/shared/components/organisms';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { NEARBY_FALLBACK_NOTES } from '../constants/distributor.constants';
import type { useNearbyDistributors } from '../hooks/use-nearby-distributors';
import type { TNearbyDistributor, TNearbyDistributorsView } from '../types/distributor.types';
import { DistributorCard } from './distributor-card';

export type TDistributorListProps = {
  query: ReturnType<typeof useNearbyDistributors>;
  /** Distributor picked on the map → highlighted and scrolled into view. */
  selectedId: string | null;
  className?: string;
};

const keyExtractor = (distributor: TNearbyDistributor) => distributor.userId;

const getFallbackNote = ({ scope, source }: TNearbyDistributorsView): string | null => {
  if (scope === 'nationwide_by_distance') return NEARBY_FALLBACK_NOTES.nationwide_by_distance;
  if (scope === 'nationwide' && source === 'query_area') return NEARBY_FALLBACK_NOTES.nationwide;
  return null;
};

/** Distributor list of home "/" (ui-ux.md §6 (7)) — infinite, card → /profile/<userId>. */
export function DistributorList({ query, selectedId, className }: TDistributorListProps) {
  const router = useRouter();
  const listRef = useRef<TInfiniteListHandle>(null);
  const provinces = useProvinces();
  const view = query.data;
  const items = view?.items ?? [];

  const provinceNames = useMemo(
    () => new Map(provinces.data?.map(({ codename, name }) => [codename, name])),
    [provinces.data],
  );

  useEffect(() => {
    if (selectedId) listRef.current?.scrollToItem(selectedId);
  }, [selectedId]);

  const openProfile = useCallback(
    (distributor: TNearbyDistributor) => router.push(ROUTES.profile(distributor.userId)),
    [router],
  );

  const note = view ? getFallbackNote(view) : null;

  return (
    <InfiniteList
      ref={listRef}
      query={query}
      items={items}
      keyExtractor={keyExtractor}
      renderItem={(distributor) => (
        <DistributorCard
          distributor={distributor}
          provinceName={provinceNames.get(distributor.address.province) ?? null}
          selected={distributor.userId === selectedId}
          onPress={openProfile}
        />
      )}
      header={
        note ? (
          <View className="rounded-lg bg-highlight-subtle px-3 py-2">
            <Text className={cn(TEXT.bodySmall, 'text-foreground')}>{note}</Text>
          </View>
        ) : null
      }
      emptyIcon="storefront-outline"
      emptyTitle="Chưa có nhà phân phối"
      emptyDescription="Thử chọn tỉnh/thành khác hoặc xoá bộ lọc."
      accessibilityLabel="Danh sách nhà phân phối"
      className={className}
      contentContainerClassName="gap-2 p-4"
    />
  );
}
