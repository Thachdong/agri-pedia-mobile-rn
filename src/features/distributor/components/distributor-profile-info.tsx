import type { ReactNode } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';
import { useSession } from '@/features/auth';
import { useAddressLabel } from '@/features/location';
import { ManageAddressesSection } from '@/features/user';
import { Avatar, Button } from '@/shared/components/atoms';
import { EmptyState, InfoTable, type TInfoTableItem } from '@/shared/components/molecules';
import { BUSINESS_TYPE_LABELS } from '@/shared/constants';
import { getErrorMessage } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import { useDistributorProfile } from '../hooks/use-distributor-profile';
import { isDistributorNotFound } from '../utils/distributor-error.util';

const openLicense = (url: string) =>
  Linking.openURL(url).catch(() => toast.error('Không mở được giấy phép. Vui lòng thử lại.'));

export type TDistributorProfileInfoProps = {
  distributorId: string;
  /** Buttons next to the title (Chỉnh sửa | Chat + Đánh giá). */
  actions?: ReactNode;
  className?: string;
};

/**
 * Distributor info (ui-ux.md §7, image-5): avatar + username, actions, then Email / Phone, Giấy phép kinh doanh (opens the
 * signed URL), Địa chỉ (primary), Lĩnh vực kinh doanh, Giới thiệu. Loading, error + retry, not found.
 * Owner: the addresses are managed below the table (M7) instead of the read-only "Địa chỉ" row.
 */
export function DistributorProfileInfo({ distributorId, actions, className }: TDistributorProfileInfoProps) {
  const { data: profile, isPending, isError, error, refetch } = useDistributorProfile(distributorId);
  const address = useAddressLabel(profile?.address);
  const session = useSession();
  const isOwner = session.user?.id === distributorId;
  // Owner unknown while the session loads → no address row yet (avoids flashing the read-only row to the owner).
  const showAddressRow = session.status !== 'loading' && !isOwner;

  if (isPending) {
    return (
      <View className={cn('items-center py-8', className)} accessibilityLabel="Đang tải thông tin">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    const notFound = isDistributorNotFound(error);
    return (
      <EmptyState
        icon={notFound ? 'person-remove-outline' : 'alert-circle-outline'}
        title={notFound ? 'Không tìm thấy nhà phân phối' : 'Không tải được thông tin'}
        description={notFound ? 'Tài khoản không tồn tại hoặc chưa được kích hoạt.' : getErrorMessage(error)}
        action={notFound ? undefined : <Button label="Thử lại" variant="outline" size="sm" onPress={() => void refetch()} />}
        className={className}
      />
    );
  }

  const license = profile.bussinessLicense;
  const rows: TInfoTableItem[] = [
    { id: 'contact', label: 'Email / Phone', value: profile.email ?? profile.phone },
    {
      id: 'license',
      label: 'Giấy phép kinh doanh',
      value: license ? (
        <Pressable
          accessibilityRole="link"
          accessibilityHint="Mở giấy phép kinh doanh"
          onPress={() => void openLicense(license)}
          hitSlop={8}
          className="min-h-11 justify-center"
        >
          <Text className={cn(TEXT.bodyMedium, 'text-highlight underline')}>Xem giấy phép</Text>
        </Pressable>
      ) : (
        'Chưa cung cấp'
      ),
    },
    ...(showAddressRow ? [{ id: 'address', label: 'Địa chỉ', value: address }] : []),
    {
      id: 'businessType',
      label: 'Lĩnh vực kinh doanh',
      value: profile.bussinessType ? BUSINESS_TYPE_LABELS[profile.bussinessType] : null,
    },
    { id: 'bio', label: 'Giới thiệu', value: profile.bio },
  ];

  return (
    <View className={cn('gap-4', className)}>
      <View className="flex-row items-center gap-3">
        {/* Avatar is a media id (no read URL yet) → initial. */}
        <Avatar name={profile.username} size="lg" />
        <Text accessibilityRole="header" numberOfLines={2} className={cn(TEXT.titleLarge, 'flex-1')}>
          {profile.username}
        </Text>
      </View>
      {actions}
      <InfoTable items={rows} />
      {isOwner && <ManageAddressesSection userId={distributorId} />}
    </View>
  );
}
