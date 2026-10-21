import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Badge, type TBadgeTone } from '@/shared/components/atoms';
import { useAppSheet } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { DIAGNOSIS_STATUS_LABELS } from '../constants/diagnosis.constants';
import { useCrops } from '../hooks/use-crops';
import type { TDiagnosis, TDiagnosisStatus } from '../types/diagnosis.types';
import { formatDiagnosisTime, sortedImages } from '../utils/diagnosis-view.util';
import { DiagnosisResultImage } from './diagnosis-result-image';
import { DiagnosisSummary } from './diagnosis-summary';
import { DiseaseSheet } from './disease-sheet';

const STATUS_TONES: Record<TDiagnosisStatus, TBadgeTone> = {
  PROCESSING: 'warning',
  COMPLETED: 'success',
  FAILED: 'destructive',
};

export type TDiagnosisReportViewProps = {
  diagnosis: TDiagnosis;
  /** Under the title (e.g. "Gửi báo cáo"). */
  actions?: ReactNode;
  /** Shown instead of the result while not COMPLETED (waiting / failed panel). */
  children?: ReactNode;
  className?: string;
};

/**
 * Report of one diagnosis: crop title + status + time + note → COMPLETED: summary → each image → disclaimer;
 * otherwise `children`. Disease names open the disease sheet.
 */
export function DiagnosisReportView({ diagnosis, actions, children, className }: TDiagnosisReportViewProps) {
  const crops = useCrops();
  const cropName = crops.data?.find((crop) => crop.code === diagnosis.cropType)?.nameVi;

  return (
    <View className={cn('gap-5', className)}>
      <View className="gap-2">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text accessibilityRole="header" className={TEXT.titleLarge}>
            Kết quả chẩn đoán{cropName ? ` — ${cropName}` : ''}
          </Text>
          <Badge tone={STATUS_TONES[diagnosis.status]} label={DIAGNOSIS_STATUS_LABELS[diagnosis.status]} />
        </View>
        <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>
          {formatDiagnosisTime(diagnosis.createdAt)}
          {diagnosis.note ? ` · Ghi chú: ${diagnosis.note}` : ''}
        </Text>
        {actions}
      </View>
      {diagnosis.status === 'COMPLETED' ? <CompletedResult diagnosis={diagnosis} /> : children}
    </View>
  );
}

function CompletedResult({ diagnosis }: { diagnosis: TDiagnosis }) {
  const diseaseSheet = useAppSheet();
  const [diseaseCode, setDiseaseCode] = useState<string | null>(null);

  const openDisease = (code: string) => {
    setDiseaseCode(code);
    diseaseSheet.open();
  };

  return (
    <>
      <DiagnosisSummary diagnosis={diagnosis} onOpenDisease={openDisease} />
      <View className="gap-3">
        <Text accessibilityRole="header" className={TEXT.titleMedium}>
          Kết quả từng ảnh
        </Text>
        {sortedImages(diagnosis.images).map((image) => (
          <DiagnosisResultImage
            key={image.index}
            image={image}
            cropType={diagnosis.cropType}
            onOpenDisease={openDisease}
          />
        ))}
      </View>
      <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>{diagnosis.disclaimer}</Text>
      <DiseaseSheet
        sheetRef={diseaseSheet.ref}
        onClose={diseaseSheet.close}
        code={diseaseCode}
        cropType={diagnosis.cropType}
      />
    </>
  );
}
