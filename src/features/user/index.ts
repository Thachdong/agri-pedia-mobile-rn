// Public API of the `user` feature. Other features and src/app import only this file.
export { AccountHeaderActions } from './components/account-header-actions';
export { useUpdateMe } from './hooks/use-update-me';
export type { TUpdateProfileInput, TUpdateProfileResponse } from './types/user.types';
