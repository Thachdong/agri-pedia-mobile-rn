import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { AddressRadioList, useAddressLabel } from '@/features/location';
import { Button, IconButton } from '@/shared/components/atoms';
import { ConfirmSheet } from '@/shared/components/molecules';
import { getErrorMessage } from '@/shared/lib/http';
import { useAppSheet } from '@/shared/lib/sheet';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import { useDeleteMyAddress } from '../hooks/use-delete-my-address';
import { useMyAddresses } from '../hooks/use-my-addresses';
import { useSetMyPrimaryAddress } from '../hooks/use-set-my-primary-address';
import type { TMyAddress } from '../types/user.types';
import { AddAddressSheet } from './add-address-sheet';

export type TManageAddressesSectionProps = {
  /** The logged-in user (owner of the profile). */
  userId: string;
  className?: string;
};

/**
 * M7 on the profile (owner only): radio = primary (confirm before PATCH; cancel keeps the old one), delete per row
 * (confirm; the primary can't be deleted — server 409), "Thêm địa chỉ" (sheet). One API call per action.
 * Loading, error + retry, empty.
 */
export function ManageAddressesSection({ userId, className }: TManageAddressesSectionProps) {
  const { data: addresses, isPending, isError, error, refetch } = useMyAddresses();
  const setPrimary = useSetMyPrimaryAddress(userId);
  const deleteAddress = useDeleteMyAddress();
  const addSheet = useAppSheet();
  const primarySheet = useAppSheet();
  const deleteSheet = useAppSheet();
  const [nextPrimary, setNextPrimary] = useState<TMyAddress | null>(null);
  const [deleting, setDeleting] = useState<TMyAddress | null>(null);
  const nextPrimaryLabel = useAddressLabel(nextPrimary);
  const deletingLabel = useAddressLabel(deleting);

  const primaryId = addresses?.find((address) => address.isPrimary)?.id;
  const isBusy = setPrimary.isPending || deleteAddress.isPending;

  const askPrimary = (addressId: string) => {
    const address = addresses?.find((item) => item.id === addressId);
    if (!address || address.isPrimary) return;
    setPrimary.reset();
    setNextPrimary(address);
    primarySheet.open();
  };

  const askDelete = (address: TMyAddress) => {
    deleteAddress.reset();
    setDeleting(address);
    deleteSheet.open();
  };

  const confirmPrimary = () => {
    if (!nextPrimary) return;
    setPrimary.mutate(nextPrimary.id, {
      onSuccess: () => {
        toast.success('Đã đổi địa chỉ mặc định');
        primarySheet.close();
      },
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteAddress.mutate(deleting.id, {
      onSuccess: () => {
        toast.success('Đã xoá địa chỉ');
        deleteSheet.close();
      },
    });
  };

  return (
    <View className={cn('gap-3', className)}>
      <View className="flex-row items-center justify-between gap-2">
        <Text accessibilityRole="header" className={TEXT.titleSmall}>
          Địa chỉ
        </Text>
        <Button label="Thêm địa chỉ" variant="outline" size="sm" onPress={addSheet.open} />
      </View>

      {isPending ? (
        <View className="items-center py-4" accessibilityLabel="Đang tải địa chỉ">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError ? (
        <View className="gap-2">
          <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodyMedium, 'text-destructive')}>
            {getErrorMessage(error)}
          </Text>
          <Button label="Thử lại" variant="outline" size="sm" className="self-start" onPress={() => void refetch()} />
        </View>
      ) : (
        <>
          <AddressRadioList
            addresses={addresses}
            value={primaryId}
            onChange={askPrimary}
            disabled={isBusy}
            renderAction={(address, checked) => (
              <IconButton
                icon="trash-outline"
                size="md"
                color="mutedForeground"
                accessibilityLabel={checked ? 'Không thể xoá địa chỉ mặc định' : 'Xoá địa chỉ'}
                disabled={checked || isBusy}
                onPress={() => askDelete(address)}
              />
            )}
          />
          {addresses.length > 0 && (
            <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
              Chọn để đổi địa chỉ mặc định. Đổi địa chỉ mặc định trước khi xoá.
            </Text>
          )}
        </>
      )}

      <AddAddressSheet sheetRef={addSheet.ref} onClose={addSheet.close} userId={userId} />
      <ConfirmSheet
        sheetRef={primarySheet.ref}
        onClose={primarySheet.close}
        title="Đặt làm địa chỉ mặc định?"
        description={nextPrimaryLabel ?? undefined}
        confirmLabel="Đặt mặc định"
        tone="normal"
        onConfirm={confirmPrimary}
        loading={setPrimary.isPending}
        error={setPrimary.error ? getErrorMessage(setPrimary.error) : undefined}
        onDismiss={() => setNextPrimary(null)}
      />
      <ConfirmSheet
        sheetRef={deleteSheet.ref}
        onClose={deleteSheet.close}
        title="Xoá địa chỉ?"
        description={deletingLabel ? `Địa chỉ "${deletingLabel}" sẽ bị xoá khỏi tài khoản.` : undefined}
        confirmLabel="Xoá"
        onConfirm={confirmDelete}
        loading={deleteAddress.isPending}
        error={deleteAddress.error ? getErrorMessage(deleteAddress.error) : undefined}
        onDismiss={() => setDeleting(null)}
      />
    </View>
  );
}
