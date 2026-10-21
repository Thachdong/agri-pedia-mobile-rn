import { useAppQuery } from '@/shared/lib/query';
import { cropsQuery } from './knowledge.queries';

export const useCrops = () => useAppQuery(cropsQuery());
