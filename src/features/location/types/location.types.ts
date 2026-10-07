import type { TApiSchema } from '@/shared/lib/http';

/** `codename` is the value sent to the API (`address.province`, `address.ward`, `provinceCode`). */
export type TLocationItem = TApiSchema<'LocationItemResponse'>;
export type TProvince = TLocationItem;
export type TListProvincesResponse = TApiSchema<'ListProvincesResponse'>;
export type TWard = TLocationItem;
export type TListWardsResponse = TApiSchema<'ListWardsResponse'>;

/** Address group value on a form — lat/long missing until a position is picked. */
export type TAddressFieldsValue = {
  province: string;
  ward: string;
  houseNumber: string;
  lat?: number;
  long?: number;
};

export type TAddressFieldsErrors = Partial<Record<'province' | 'ward' | 'houseNumber' | 'location', string>>;
