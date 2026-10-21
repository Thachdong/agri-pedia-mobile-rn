import { appQueryOptions, queryKeys } from '@/shared/lib/query';
import { getDiagnosis, getDiagnosisSettings } from '../services/diagnosis.service';

/** `silent`: settings failing never blocks the form (client defaults). */
export const diagnosisSettingsQuery = () =>
  appQueryOptions({
    queryKey: queryKeys.diagnoses.settings(),
    queryFn: ({ signal }) => getDiagnosisSettings(signal),
    meta: { silent: true },
  });

/** Image URLs are signed (~1h) → refetched when stale. `silent`: the result page shows errors inline. */
export const diagnosisQuery = (id: string) =>
  appQueryOptions({
    queryKey: queryKeys.diagnoses.detail(id),
    queryFn: ({ signal }) => getDiagnosis(id, signal),
    meta: { silent: true },
  });
