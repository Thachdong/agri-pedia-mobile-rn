import { useAppQuery } from '@/shared/lib/query';
import { diseaseQuery } from './knowledge.queries';

export const useDisease = (code: string) => useAppQuery(diseaseQuery(code));
