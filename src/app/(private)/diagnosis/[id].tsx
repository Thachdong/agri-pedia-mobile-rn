import { useLocalSearchParams } from 'expo-router';
import { EmptyState } from '@/shared/components/molecules';
import { ScreenHeader } from '@/shared/components/organisms';
import { ScreenLayout } from '@/shared/components/templates';

/** Diagnosis report "/diagnosis/<id>" — private. MOCK: out of the home scope (Specs/19102026), no API yet. */
export default function DiagnosisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenLayout header={<ScreenHeader title="Kết quả chẩn đoán" />}>
      <EmptyState
        icon="scan-outline"
        title="Đã gửi ảnh chẩn đoán"
        description={`AI đang phân tích (mã ${id}). Trang kết quả đang được phát triển.`}
        className="flex-1"
      />
    </ScreenLayout>
  );
}
