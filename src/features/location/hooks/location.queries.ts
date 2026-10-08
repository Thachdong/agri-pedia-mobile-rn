import { appQueryOptions, queryKeys } from '@/shared/lib/query';
import { getProvinces, getWards } from '../services/location.service';

/** Master data, unchanged during a session → never refetched. */
export const provincesQuery = () =>
  appQueryOptions({
    queryKey: queryKeys.location.provinces(),
    queryFn: ({ signal }) => getProvinces(signal),
    staleTime: Infinity,
  });

export const wardsQuery = (provinceCode: string) =>
  appQueryOptions({
    queryKey: queryKeys.location.wards(provinceCode),
    queryFn: ({ signal }) => getWards(provinceCode, signal),
    staleTime: Infinity,
  });
