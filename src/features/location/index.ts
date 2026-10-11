// Public API of the `location` feature. Other features and src/app import only this file.
export { AddressFields, type TAddressFieldsProps } from './components/address-fields';
export {
  AddressRadioList,
  type TAddressRadioItem,
  type TAddressRadioListProps,
} from './components/address-radio-list';
export { provincesQuery, wardsQuery } from './hooks/location.queries';
export { useAddressLabel, type TAddressCodes } from './hooks/use-address-label';
export { useProvinces } from './hooks/use-provinces';
export { useWards } from './hooks/use-wards';
export type {
  TAddressFieldsErrors,
  TAddressFieldsValue,
  TLocationItem,
  TProvince,
  TWard,
} from './types/location.types';
