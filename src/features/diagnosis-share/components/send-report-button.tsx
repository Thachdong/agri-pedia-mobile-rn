import { View } from 'react-native';
import { useSession } from '@/features/auth';
import { useDiagnosis } from '@/features/diagnosis';
import { Button } from '@/shared/components/atoms';
import { useAppSheet } from '@/shared/lib/sheet';
import { SendReportSheet } from './send-report-sheet';

/**
 * "Gửi báo cáo" on the result screen — FARMER only (a DISTRIBUTOR does not see it) and only once COMPLETED. Reads the
 * result screen's cache, so it shows as soon as the result arrives.
 */
export function SendReportButton({ diagnosisId, className }: { diagnosisId: string; className?: string }) {
  const session = useSession();
  const { data: diagnosis } = useDiagnosis(diagnosisId);
  const sheet = useAppSheet();

  if (session.status !== 'authenticated' || session.user.role !== 'FARMER' || diagnosis?.status !== 'COMPLETED') {
    return null;
  }

  return (
    <View className={className}>
      <Button label="Gửi báo cáo" variant="highlight" onPress={sheet.open} />
      <SendReportSheet
        sheetRef={sheet.ref}
        onClose={sheet.close}
        diagnosis={diagnosis}
        currentUserId={session.user.id}
      />
    </View>
  );
}
