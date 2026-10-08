import { useAppQuery } from '@/shared/lib/query';
import { wardsQuery } from './location.queries';

/** No province chosen → no request. */
export const useWards = (provinceCode?: string) =>
  useAppQuery({
    ...wardsQuery(provinceCode ?? ''),
    enabled: Boolean(provinceCode),
    select: (data) => data.wards,
  });
