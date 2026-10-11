// Public API of the `user` feature. Other features and src/app import only this file.
export { AccountHeaderActions } from './components/account-header-actions';
export { EditProfileSheet, type TEditProfileSheetProps } from './components/edit-profile-sheet';
export { useCreateMyAddress } from './hooks/use-create-my-address';
export { useDeleteMyAddress } from './hooks/use-delete-my-address';
export { useMyAddresses } from './hooks/use-my-addresses';
export { useSetMyPrimaryAddress } from './hooks/use-set-my-primary-address';
export { useUpdateMe } from './hooks/use-update-me';
export { myAddressesQuery } from './hooks/user.queries';
export type {
  TCreateAddressFormValues,
  TCreateAddressInput,
  TCreateAddressResponse,
  TEditProfileFormValues,
  TMyAddress,
  TUpdateProfileInput,
  TUpdateProfileResponse,
} from './types/user.types';
