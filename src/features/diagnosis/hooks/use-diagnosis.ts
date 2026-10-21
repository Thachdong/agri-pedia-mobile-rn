import { useAppQuery } from '@/shared/lib/query';
import { diagnosisQuery } from './diagnosis.queries';

/** Same cache as the result screen (useDiagnosisLive polls; this one only reads / fetches). */
export const useDiagnosis = (id: string) => useAppQuery(diagnosisQuery(id));
