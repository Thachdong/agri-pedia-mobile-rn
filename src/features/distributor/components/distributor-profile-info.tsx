import type { ReactNode } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';
import { useAddressLabel } from '@/features/location';
import { Avatar, Button } from '@/shared/components/atoms';
import { EmptyState, InfoTable, type TInfoTableItem } from '@/shared/components/molecules';
import { BUSINESS_TYPE_LABELS } from '@/shared/constants';
import { APP_ERROR_CODE, getErrorMessage, isAppError } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import { useDistributorProfile } from '../hooks/use-distributor-profile';

const NOT_FOUND_CODE = 'USER_DISTRIBUTOR_NOT_FOUND';

export type TDistributorProfileInfoProps = {
  distributorId: string;
  /** Buttons next to the title (Chỉnh sửa | Chat + Đánh giá). */
  actions?: ReactNode;
  className?: string;
};

/**
 * Distributor info (ui-ux.md §7, image-5): avatar + username, actions, then Email / Phone, Giấy phép kinh doanh (opens the
 * signed URL), Địa chỉ (primary), Lĩnh vực kinh doanh, Giới thiệu. Loading, error + retry, not found.
 */
export function DistributorProfileInfo({ distributorId, actions, className }: TDistributorProfileInfoProps) {
  const { data: profile, isPending, isError, error, refetch } = useDistributorProfile(distributorId);
  const address = useAddressLabel(profile?.address);

  if (isPending) {
    return (
      <View className={cn('items-center py-8', className)} accessibilityLabel="Đang tải thông tin">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    const notFound = isAppError(error) && (error.code === NOT_FOUND_CODE || error.status === 404);
    return (
      <EmptyState
        icon={notFound ? 'person-remove-outline' : 'alert-circle-outline'}
        title={notFound ? 'Không tìm thấy nhà phân phối' : 'Không tải được thông tin'}
        description={notFound ? 'Tài khoản không tồn tại hoặc chưa được kích hoạt.' : getErrorMessage(error)}
        action={
          notFound || (isAppError(error) && error.code === APP_ERROR_CODE.VALIDATION_ERROR) ? undefined : (
            <Button label="Thử lại" variant="outline" size="sm" onPress={() => void refetch()} />
          )
        }
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
          onPress={() => void Linking.openURL(license)}
          hitSlop={8}
          className="min-h-11 justify-center"
        >
          <Text className={cn(TEXT.bodyMedium, 'text-highlight underline')}>Xem giấy phép</Text>
        </Pressable>
      ) : (
        'Chưa cung cấp'
      ),
    },
    { id: 'address', label: 'Địa chỉ', value: address },
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
    </View>
  );
}
