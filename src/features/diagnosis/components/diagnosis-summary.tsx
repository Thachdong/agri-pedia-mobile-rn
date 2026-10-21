import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/shared/components/atoms';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { IMAGE_STATUS_LABELS } from '../constants/diagnosis.constants';
import { useCropLabels, type TCropLabels } from '../hooks/use-crop-labels';
import type { TDiagnosis, TDiagnosisImage } from '../types/diagnosis.types';
import {
  formatLocation,
  imagePartLabel,
  regionsOfDisease,
  sortedImages,
  uniqueSymptoms,
} from '../utils/diagnosis-view.util';
import { ConfidenceBadge } from './confidence-badge';
import { DiseaseNameButton } from './disease-name-button';

export type TDiagnosisSummaryProps = {
  diagnosis: Pick<TDiagnosis, 'summary' | 'images' | 'cropType'>;
  /** Disease name pressed → its information sheet. */
  onOpenDisease: (code: string) => void;
  className?: string;
};

/**
 * Summary of a completed diagnosis: overall conclusion, conflict warning, one row per image — thumbnail + part, diseases
 * found (link) with confidence and location, symptoms. Phone layout of the web table.
 */
export function DiagnosisSummary({ diagnosis, onOpenDisease, className }: TDiagnosisSummaryProps) {
  const { partLabel } = useCropLabels(diagnosis.cropType);

  return (
    <View className={cn('gap-4 rounded-xl border border-border-subtle bg-card p-4', className)}>
      <Conclusion diagnosis={diagnosis} />
      {diagnosis.summary?.conflict && (
        <View className="rounded-lg bg-warning-subtle px-3 py-2">
          <Text className={cn(TEXT.bodyMedium, 'text-warning')}>Các ảnh cho kết quả khác nhau, nên kiểm tra thêm.</Text>
        </View>
      )}
      {sortedImages(diagnosis.images).map((image) => (
        <ImageRow key={image.index} image={image} partLabel={partLabel} onOpenDisease={onOpenDisease} />
      ))}
    </View>
  );
}

function Conclusion({ diagnosis }: { diagnosis: Pick<TDiagnosis, 'summary' | 'images'> }) {
  const { summary, images } = diagnosis;
  const allHealthy = images.length > 0 && images.every((image) => image.status === 'HEALTHY');

  if (summary?.hasDisease) {
    return (
      <View className="flex-row items-center gap-2">
        <Icon name="medkit-outline" color="highlight" />
        <Text accessibilityRole="header" className={cn(TEXT.titleMedium, 'flex-1')}>
          Phát hiện {summary.diseases.length} bệnh có thể có
        </Text>
      </View>
    );
  }
  if (allHealthy) {
    return (
      <View className="flex-row items-center gap-2">
        <Icon name="checkmark-circle-outline" color="success" />
        <Text accessibilityRole="header" className={cn(TEXT.titleMedium, 'flex-1')}>
          Không phát hiện dấu hiệu bệnh
        </Text>
      </View>
    );
  }
  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-2">
        <Icon name="help-circle-outline" color="mutedForeground" />
        <Text accessibilityRole="header" className={cn(TEXT.titleMedium, 'flex-1')}>
          Chưa xác định được bệnh
        </Text>
      </View>
      <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>Vui lòng thử ảnh khác (chụp gần, rõ vết bệnh).</Text>
    </View>
  );
}

type TImageRowProps = {
  image: TDiagnosisImage;
  partLabel: TCropLabels['partLabel'];
  onOpenDisease: (code: string) => void;
};

function ImageRow({ image, partLabel, onOpenDisease }: TImageRowProps) {
  const label = `Ảnh ${image.index + 1} · ${imagePartLabel(image, partLabel)}`;
  const symptoms = uniqueSymptoms(image.regions);
  const noDiseaseText = image.message ?? (image.status ? IMAGE_STATUS_LABELS[image.status] : 'Không phát hiện bệnh');

  return (
    <View className="flex-row gap-3 border-t border-border-subtle pt-4">
      <View className="items-center gap-1">
        <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-surface">
          {image.url ? (
            <Image source={{ uri: image.url }} contentFit="cover" style={StyleSheet.absoluteFill} />
          ) : (
            <Icon name="image-outline" color="mutedForeground" />
          )}
        </View>
      </View>
      <View className="flex-1 gap-2">
        <Text className={cn(TEXT.labelMedium, 'text-muted-foreground')}>{label}</Text>
        {image.diseases.length > 0 ? (
          image.diseases.map((disease) => (
            <View key={`${disease.diseaseCode}-${disease.variantCode ?? ''}`} className="gap-1">
              <DiseaseNameButton
                name={disease.diseaseName}
                variantName={disease.variantName}
                onPress={() => onOpenDisease(disease.diseaseCode)}
              />
              <View className="flex-row flex-wrap items-center gap-2">
                <ConfidenceBadge level={disease.confidence.level} />
                <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
                  {formatLocation(image, regionsOfDisease(image, disease.diseaseCode).length, partLabel)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>{noDiseaseText}</Text>
        )}
        {symptoms.length > 0 && (
          <View className="gap-0.5">
            <Text className={cn(TEXT.labelMedium, 'text-muted-foreground')}>Triệu chứng</Text>
            {symptoms.map((symptom) => (
              <Text key={symptom} className={TEXT.bodySmall}>
                • {symptom}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
