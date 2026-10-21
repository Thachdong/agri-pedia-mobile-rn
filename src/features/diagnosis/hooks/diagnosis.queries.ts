import { appQueryOptions, queryKeys } from '@/shared/lib/query';
import { getDiagnosisSettings } from '../services/diagnosis.service';

/** `silent`: settings failing never blocks the form (client defaults). */
export const diagnosisSettingsQuery = () =>
  appQueryOptions({
    queryKey: queryKeys.diagnoses.settings(),
    queryFn: ({ signal }) => getDiagnosisSettings(signal),
    meta: { silent: true },
  });
