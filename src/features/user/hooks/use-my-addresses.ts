import { useAppQuery } from '@/shared/lib/query';
import type { TMyAddressesResponse } from '../types/user.types';
import { myAddressesQuery } from './user.queries';

const selectAddresses = ({ addresses }: TMyAddressesResponse) => addresses;

/** Addresses of the logged-in user, primary first. */
export const useMyAddresses = () => useAppQuery({ ...myAddressesQuery(), select: selectAddresses });
