import type { TBusinessType } from '@/shared/types';

/** Labels of DISTRIBUTOR business types — register (auth) and the distributor list. Same text as web. */
export const BUSINESS_TYPE_OPTIONS = [
  { value: 'AGRICULTURAL_CHEMICAL_SUPPLIES', label: 'Vật tư nông nghiệp (phân bón, thuốc BVTV)' },
  { value: 'SEEDS_SEEDLINGS', label: 'Giống cây trồng' },
  { value: 'AQUACULTURE_SEEDLINGS', label: 'Giống thuỷ sản' },
] as const satisfies readonly { value: TBusinessType; label: string }[];

export const BUSINESS_TYPE_LABELS = Object.fromEntries(
  BUSINESS_TYPE_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<TBusinessType, string>;
