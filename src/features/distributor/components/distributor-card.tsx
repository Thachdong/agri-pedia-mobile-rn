import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '@/shared/components/atoms';
import { BUSINESS_TYPE_LABELS } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { formatDistance } from '@/shared/utils';
import type { TNearbyDistributor } from '../types/distributor.types';

export type TDistributorCardProps = {
  distributor: TNearbyDistributor;
  /** Province name resolved from the `address.province` codename; null → codename hidden (still loading). */
  provinceName: string | null;
  selected?: boolean;
  onPress: (distributor: TNearbyDistributor) => void;
  className?: string;
};

/**
 * One row of the home list (ui-ux.md §6 (7)): avatar, username, business type, province, distance (distance scopes only).
 * `avatar` is a media id without a URL endpoint yet → initial only (same as web). No rating: not in the API.
 */
export const DistributorCard = memo(function DistributorCard({
  distributor,
  provinceName,
  selected = false,
  onPress,
  className,
}: TDistributorCardProps) {
  const { username, bussinessType, distanceMeters } = distributor;
  const place = [provinceName, distanceMeters === null ? null : formatDistance(distanceMeters)]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityHint="Mở trang nhà phân phối"
      onPress={() => onPress(distributor)}
      className={cn(
        'min-h-11 flex-row items-center gap-3 rounded-lg border px-3 py-3 active:opacity-80',
        selected ? 'border-highlight bg-highlight-subtle' : 'border-border-subtle bg-card',
        className,
      )}
    >
      <Avatar name={username} />
      <View className="flex-1 gap-0.5">
        <Text numberOfLines={1} className={TEXT.titleSmall}>
          {username}
        </Text>
        {bussinessType && (
          <Text numberOfLines={1} className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
            {BUSINESS_TYPE_LABELS[bussinessType]}
          </Text>
        )}
        {place !== '' && (
          <Text numberOfLines={1} className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
            {place}
          </Text>
        )}
      </View>
    </Pressable>
  );
});
