import { useProvinces } from './use-provinces';
import { useWards } from './use-wards';

/** An address as the API returns it (`province` / `ward` are codenames). */
export type TAddressCodes = { province: string; ward: string; houseNumber: string };

/**
 * "Số nhà, Phường/Xã, Tỉnh/Thành" — names from provinces / wards (master data, long cache).
 * Not loaded yet / not found → the codename for now. `null` → `null`. Same as web.
 */
export function useAddressLabel(address: TAddressCodes | null | undefined): string | null {
  const { data: provinces } = useProvinces();
  const { data: wards } = useWards(address?.province);
  if (!address) return null;

  const provinceName = provinces?.find((item) => item.codename === address.province)?.name ?? address.province;
  const wardName = wards?.find((item) => item.codename === address.ward)?.name ?? address.ward;
  return [address.houseNumber.trim(), wardName, provinceName].filter(Boolean).join(', ');
}
