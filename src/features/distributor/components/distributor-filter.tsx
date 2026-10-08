import { View } from 'react-native';
import { useProvinces, type TProvince } from '@/features/location';
import { Button } from '@/shared/components/atoms';
import { SelectField, type TSelectOption } from '@/shared/components/molecules';
import { cn } from '@/shared/lib/utils';
import { NEAR_ME_ACTIVE_HINT } from '../constants/distributor.constants';
import type { TDistributorFilter } from '../hooks/use-distributor-filter';

export type TDistributorFilterProps = {
  filter: TDistributorFilter;
  isLocatingNear: boolean;
  onProvinceChange: (provinceCode: string) => void;
  onNearMe: () => void;
  onClear: () => void;
  disabled?: boolean;
  className?: string;
};

const toOptions = (provinces: readonly TProvince[] | undefined): TSelectOption<string>[] =>
  provinces?.map(({ codename, name }) => ({ value: codename, label: name })) ?? [];

/**
 * Search and filter of home "/" (ui-ux.md §6 (6)): a province OR "Gần tôi" (API: a point and an area never together).
 * Categories are not in the API yet → not shown.
 */
export function DistributorFilter({
  filter,
  isLocatingNear,
  onProvinceChange,
  onNearMe,
  onClear,
  disabled = false,
  className,
}: TDistributorFilterProps) {
  const provinces = useProvinces();

  return (
    <View className={cn('gap-2', className)}>
      <View className="flex-row items-end gap-2">
        <SelectField
          label="Tỉnh/Thành phố"
          placeholder="Tất cả"
          options={toOptions(provinces.data)}
          value={filter.kind === 'province' ? filter.provinceCode : null}
          onChange={onProvinceChange}
          loading={provinces.isPending}
          disabled={disabled}
          error={provinces.isError ? 'Không tải được danh sách tỉnh/thành.' : undefined}
          onRetry={provinces.isError ? () => void provinces.refetch() : undefined}
          className="flex-1"
        />
        <Button
          label="Gần tôi"
          variant={filter.kind === 'near' ? 'highlight' : 'outline'}
          accessibilityHint={filter.kind === 'near' ? NEAR_ME_ACTIVE_HINT : undefined}
          loading={isLocatingNear}
          disabled={disabled}
          onPress={onNearMe}
        />
      </View>
      {filter.kind !== 'auto' && (
        <Button label="Xoá lọc" variant="link" size="sm" disabled={disabled} onPress={onClear} className="self-start px-0" />
      )}
    </View>
  );
}
