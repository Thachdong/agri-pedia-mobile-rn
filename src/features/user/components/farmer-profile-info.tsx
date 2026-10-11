import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSession } from '@/features/auth';
import { Avatar, Button } from '@/shared/components/atoms';
import { InfoTable, type TInfoTableItem } from '@/shared/components/molecules';
import { queryKeys, useAppQueryClient } from '@/shared/lib/query';
import { useAppSheet } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import { EditProfileSheet } from './edit-profile-sheet';
import { ManageAddressesSection } from './manage-addresses-section';

export type TFarmerProfileInfoProps = { className?: string };

/**
 * Own profile of the logged-in FARMER (/profile/me, layout of ui-ux.md §7 without tabs): avatar + username, "Chỉnh sửa"
 * (M6), Email / Phone + Giới thiệu, then the addresses (M7 on the page). Pull to refresh reloads profile + addresses.
 */
export function FarmerProfileInfo({ className }: TFarmerProfileInfoProps) {
  const { user } = useSession();
  const queryClient = useAppQueryClient();
  const editSheet = useAppSheet();
  const [refreshing, setRefreshing] = useState(false);

  if (!user) {
    return (
      <View className={cn('items-center py-8', className)} accessibilityLabel="Đang tải thông tin">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all(
        [queryKeys.users.me(), queryKeys.users.addresses()].map((queryKey) => queryClient.refetchQueries({ queryKey })),
      );
    } finally {
      setRefreshing(false);
    }
  };

  const rows: TInfoTableItem[] = [
    { id: 'contact', label: 'Email / Phone', value: user.email ?? user.phone },
    { id: 'bio', label: 'Giới thiệu', value: user.bio },
  ];

  return (
    <ScrollView
      className={cn('flex-1', className)}
      contentContainerClassName="gap-6 px-4 py-4"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void refresh()}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View className="gap-4">
        <View className="flex-row items-center gap-3">
          {/* Avatar is a media id (no read URL yet) → initial. */}
          <Avatar name={user.username} size="lg" />
          <Text accessibilityRole="header" numberOfLines={2} className={cn(TEXT.titleLarge, 'flex-1')}>
            {user.username}
          </Text>
        </View>
        <View className="flex-row">
          <Button label="Chỉnh sửa" variant="outline" size="sm" onPress={editSheet.open} />
        </View>
        <InfoTable items={rows} />
      </View>
      <ManageAddressesSection userId={user.id} />
      <EditProfileSheet sheetRef={editSheet.ref} onClose={editSheet.close} />
    </ScrollView>
  );
}
