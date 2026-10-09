import { useAppQuery } from '@/shared/lib/query';
import { distributorProfileQuery } from './distributor-profile.queries';

export const useDistributorProfile = (distributorId: string) => useAppQuery(distributorProfileQuery(distributorId));
