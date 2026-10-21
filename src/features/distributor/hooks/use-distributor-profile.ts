import { useAppQuery } from '@/shared/lib/query';
import { distributorProfileQuery } from './distributor-profile.queries';

export const useDistributorProfile = (distributorId: string, { enabled = true }: { enabled?: boolean } = {}) =>
  useAppQuery({ ...distributorProfileQuery(distributorId), enabled });
