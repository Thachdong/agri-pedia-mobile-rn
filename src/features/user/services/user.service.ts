import { http } from '@/shared/lib/http';
import type {
  TCreateAddressInput,
  TCreateAddressResponse,
  TMyAddressesResponse,
  TUpdateProfileInput,
  TUpdateProfileResponse,
} from '../types/user.types';

/** 400 USER_BUSINESS_TYPE_NOT_ALLOWED / USER_BUSINESS_TYPE_REQUIRED, 404 USER_NOT_FOUND. */
export const updateMe = (input: TUpdateProfileInput) => http.patch<TUpdateProfileResponse>('/users/me', input);

/** Every address of the caller, primary first. */
export const getMyAddresses = (signal?: AbortSignal) =>
  http.get<TMyAddressesResponse>('/users/me/addresses', { signal });

/** `isPrimary: true` → the new address becomes primary. 400 USER_INVALID_COORDINATES / USER_LOCATION_INVALID. */
export const createMyAddress = (input: TCreateAddressInput) =>
  http.post<TCreateAddressResponse>('/users/me/addresses', input);

/** The old primary becomes a normal address; already primary → 200. 404 USER_ADDRESS_NOT_FOUND. */
export const setMyPrimaryAddress = (addressId: string) =>
  http.patch<void>(`/users/me/addresses/${encodeURIComponent(addressId)}/primary`);

/** Hard delete. Primary → 409 USER_ADDRESS_PRIMARY_NOT_DELETABLE (set another primary first). 404 USER_ADDRESS_NOT_FOUND. */
export const deleteMyAddress = (addressId: string) =>
  http.delete<void>(`/users/me/addresses/${encodeURIComponent(addressId)}`);
