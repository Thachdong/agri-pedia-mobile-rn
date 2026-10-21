import type { TProductStatus, TProductUnit } from '../types/product.types';

/** Values the server accepts (CreateProductDto / UpdateProductDto) + display labels, in select order. Same as web. */
export const PRODUCT_UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: '10kg', label: 'bao 10kg' },
  { value: '50kg', label: 'bao 50kg' },
  { value: '100kg', label: 'bao 100kg' },
  { value: 'bag', label: 'bao' },
  { value: 'piece', label: 'cái' },
  { value: 'ton', label: 'tấn' },
] as const satisfies readonly { value: TProductUnit; label: string }[];

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Đang bán' },
  { value: 'INACTIVE', label: 'Ngừng bán' },
  { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
] as const satisfies readonly { value: TProductStatus; label: string }[];

export const PRODUCT_UNITS = PRODUCT_UNIT_OPTIONS.map((option) => option.value);
export const PRODUCT_STATUSES = PRODUCT_STATUS_OPTIONS.map((option) => option.value);

export const PRODUCT_UNIT_LABELS = Object.fromEntries(
  PRODUCT_UNIT_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<TProductUnit, string>;

export const PRODUCT_STATUS_LABELS = Object.fromEntries(
  PRODUCT_STATUS_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<TProductStatus, string>;

/** DTO constraints (CreateProductDto / UpdateProductDto). */
export const PRODUCT_NAME_MAX = 255;
export const PRODUCT_DESCRIPTION_MAX = 5000;
export const PRODUCT_PRICE_MAX = 999_999_999_999.99;
export const PRODUCT_QUANTITY_MAX = 2_147_483_647;
/** Images of a product in the form (kept + new): create sends 1..10; update addMedia / removeMediaIds 0..10. */
export const PRODUCT_MEDIA_MAX = 10;
