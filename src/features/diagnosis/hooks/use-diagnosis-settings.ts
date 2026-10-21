import { useAppQuery } from '@/shared/lib/query';
import { diagnosisSettingsQuery } from './diagnosis.queries';

export const useDiagnosisSettings = () => useAppQuery(diagnosisSettingsQuery());
