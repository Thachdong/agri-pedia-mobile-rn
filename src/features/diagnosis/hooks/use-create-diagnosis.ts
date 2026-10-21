import { queryKeys, useAppMutation } from '@/shared/lib/query';
import { createDiagnosis } from '../services/diagnosis.service';

/** The form shows the error itself (per image / under the form) → `silent`. `remainingToday` drops by one. */
export const useCreateDiagnosis = () =>
  useAppMutation({
    mutationFn: createDiagnosis,
    meta: { silent: true },
    invalidates: () => [queryKeys.diagnoses.settings()],
  });
