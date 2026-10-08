import type { Ref } from 'react';
import type { TextInput } from 'react-native';
import { Text, View } from 'react-native';
import { FormInput, SelectField } from '@/shared/components/molecules';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { useProvinces } from '../hooks/use-provinces';
import { useWards } from '../hooks/use-wards';
import type { TAddressFieldsErrors, TAddressFieldsValue } from '../types/location.types';
import { LocationPickerField } from './location-picker-field';

export type TAddressFieldsProps = {
  value: TAddressFieldsValue;
  /** Receives the changed part; changing the province always comes with `ward: ''`. */
  onChange: (patch: Partial<TAddressFieldsValue>) => void;
  /** Leaving a field (form validates onTouched). */
  onBlur?: (field: keyof TAddressFieldsErrors) => void;
  errors?: TAddressFieldsErrors;
  disabled?: boolean;
  /** House number input — lets the form focus it (server error, next-field). */
  houseNumberRef?: Ref<TextInput>;
  className?: string;
};

const toOptions = (items: readonly { codename: string; name: string }[] | undefined) =>
  items?.map((item) => ({ value: item.codename, label: item.name })) ?? [];

/** Primary address: province → ward (of that province) → house number → position on the map. */
export function AddressFields({
  value,
  onChange,
  onBlur,
  errors = {},
  disabled = false,
  houseNumberRef,
  className,
}: TAddressFieldsProps) {
  const provinces = useProvinces();
  const wards = useWards(value.province || undefined);
  const hasProvince = Boolean(value.province);

  return (
    <View className={cn('gap-4', className)}>
      <Text accessibilityRole="header" className={TEXT.titleSmall}>
        Địa chỉ
      </Text>

      <SelectField
        label="Tỉnh/Thành phố"
        placeholder="Chọn tỉnh/thành phố"
        required
        options={toOptions(provinces.data)}
        value={value.province || null}
        onChange={(province) => {
          if (province !== value.province) onChange({ province, ward: '' });
          onBlur?.('province');
        }}
        loading={provinces.isPending}
        disabled={disabled}
        error={errors.province ?? (provinces.isError ? 'Không tải được danh sách tỉnh/thành.' : undefined)}
        onRetry={provinces.isError ? () => void provinces.refetch() : undefined}
      />

      <SelectField
        label="Phường/Xã"
        placeholder={hasProvince ? 'Chọn phường/xã' : 'Chọn tỉnh/thành phố trước'}
        required
        options={toOptions(wards.data)}
        value={value.ward || null}
        onChange={(ward) => {
          onChange({ ward });
          onBlur?.('ward');
        }}
        loading={hasProvince && wards.isPending}
        disabled={disabled || !hasProvince}
        error={errors.ward ?? (wards.isError ? 'Không tải được danh sách phường/xã.' : undefined)}
        onRetry={wards.isError ? () => void wards.refetch() : undefined}
      />

      <FormInput
        ref={houseNumberRef}
        label="Số nhà, tên đường"
        required
        value={value.houseNumber}
        onChangeText={(houseNumber) => onChange({ houseNumber })}
        onBlur={() => onBlur?.('houseNumber')}
        error={errors.houseNumber}
        editable={!disabled}
        maxLength={255}
        autoComplete="street-address"
        textContentType="fullStreetAddress"
        placeholder="VD: 12 Nguyễn Trãi"
        returnKeyType="done"
      />

      <LocationPickerField
        value={value.lat !== undefined && value.long !== undefined ? { lat: value.lat, long: value.long } : null}
        onChange={({ lat, long }) => onChange({ lat, long })}
        error={errors.location}
        required
        disabled={disabled}
      />
    </View>
  );
}
