// Public API of the `location` feature. Other features and src/app import only this file.
export { provincesQuery, wardsQuery } from './hooks/location.queries';
export { useProvinces } from './hooks/use-provinces';
export { useWards } from './hooks/use-wards';
export type { TLocationItem, TProvince, TWard } from './types/location.types';
