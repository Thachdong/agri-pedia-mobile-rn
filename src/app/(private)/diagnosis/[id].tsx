import { useLocalSearchParams } from 'expo-router';
import { DiagnosisResult } from '@/features/diagnosis';
import { SendReportButton } from '@/features/diagnosis-share';
import { ScreenHeader } from '@/shared/components/organisms';
import { ScreenLayout } from '@/shared/components/templates';

/**
 * Diagnosis report "/diagnosis/<id>" — private (Specs/19102026): waits for the result (realtime + polling), then the
 * summary and each image. FARMER + COMPLETED → "Gửi báo cáo" (send it to a distributor through chat).
 */
export default function DiagnosisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenLayout header={<ScreenHeader title="Kết quả chẩn đoán" />}>
      <DiagnosisResult key={id} id={id} actions={<SendReportButton diagnosisId={id} className="self-start" />} />
    </ScreenLayout>
  );
}
