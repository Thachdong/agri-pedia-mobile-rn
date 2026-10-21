import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { useAddressLabel, type TAddressCodes } from '../hooks/use-address-label';

export type TAddressRadioItem = TAddressCodes & { id: string };

export type TAddressRadioListProps<T extends TAddressRadioItem> = {
  addresses: readonly T[];
  /** Id of the selected address (primary). */
  value: string | undefined;
  onChange: (addressId: string) => void;
  /** Button next to each row (e.g. delete) — outside the radio, so pressing it doesn't change the choice. */
  renderAction?: (address: T, checked: boolean) => ReactNode;
  disabled?: boolean;
  emptyText?: string;
  accessibilityLabel?: string;
  className?: string;
};

/**
 * Addresses as radios (province / ward names looked up from codenames) — one row = the primary address.
 * The selected row has a "Mặc định" badge. Calling the API is the caller's job. Same as web.
 */
export function AddressRadioList<T extends TAddressRadioItem>({
  addresses,
  value,
  onChange,
  renderAction,
  disabled = false,
  emptyText = 'Chưa có địa chỉ',
  accessibilityLabel = 'Chọn địa chỉ mặc định',
  className,
}: TAddressRadioListProps<T>) {
  if (addresses.length === 0) {
    return <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground', className)}>{emptyText}</Text>;
  }

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} className={cn('gap-2', className)}>
      {addresses.map((address) => {
        const checked = address.id === value;
        return (
          <AddressRadioRow
            key={address.id}
            address={address}
            checked={checked}
            disabled={disabled}
            onPress={() => onChange(address.id)}
            action={renderAction?.(address, checked)}
          />
        );
      })}
    </View>
  );
}

type TAddressRadioRowProps = {
  address: TAddressRadioItem;
  checked: boolean;
  disabled: boolean;
  onPress: () => void;
  action?: ReactNode;
};

function AddressRadioRow({ address, checked, disabled, onPress, action }: TAddressRadioRowProps) {
  const label = useAddressLabel(address) ?? '';
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 rounded-lg border pl-3',
        checked ? 'border-primary bg-surface' : 'border-border-subtle bg-background',
      )}
    >
      <Pressable
        accessibilityRole="radio"
        accessibilityLabel={checked ? `${label}. Mặc định` : label}
        accessibilityState={{ checked, disabled }}
        disabled={disabled}
        onPress={onPress}
        className={cn('min-h-12 flex-1 flex-row items-center gap-3 py-2.5', disabled && 'opacity-50')}
      >
        <View
          className={cn(
            'h-5 w-5 items-center justify-center rounded-full border-2',
            checked ? 'border-primary' : 'border-input',
          )}
        >
          {checked && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
        </View>
        <View className="flex-1 gap-1">
          <Text className={TEXT.bodyMedium}>{label}</Text>
          {checked && (
            <View className="self-start rounded-md bg-highlight-subtle px-1.5 py-0.5">
              <Text className={cn(TEXT.labelSmall, 'text-highlight')}>Mặc định</Text>
            </View>
          )}
        </View>
      </Pressable>
      {action}
    </View>
  );
}
