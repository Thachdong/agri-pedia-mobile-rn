import { useAppQuery } from '@/shared/lib/query';
import { provincesQuery } from './location.queries';

export const useProvinces = () => useAppQuery({ ...provincesQuery(), select: (data) => data.provinces });
