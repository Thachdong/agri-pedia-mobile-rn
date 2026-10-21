import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge, Icon, type TBadgeTone } from '@/shared/components/atoms';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { CATEGORY_LABELS, IMAGE_STATUS_LABELS } from '../constants/diagnosis.constants';
import { useCropLabels } from '../hooks/use-crop-labels';
import type { TDiagnosisImage, TDiagnosisImageStatus } from '../types/diagnosis.types';
import { formatLocation, regionName, regionsOfDisease, uniqueSymptoms } from '../utils/diagnosis-view.util';
import { ConfidenceBadge } from './confidence-badge';
import { DiseaseNameButton } from './disease-name-button';
import { RegionOverlay } from './region-overlay';

const IMAGE_STATUS_TONES: Record<TDiagnosisImageStatus, TBadgeTone> = {
  DISEASED: 'highlight',
  HEALTHY: 'success',
  UNCERTAIN: 'neutral',
  NOT_TARGET_CROP: 'warning',
  LOW_QUALITY: 'warning',
};

/** Until the image tells its size. */
const DEFAULT_ASPECT_RATIO = 4 / 3;

export type TDiagnosisResultImageProps = {
  image: TDiagnosisImage;
  /** Crop of the diagnosis — crop-specific part labels. */
  cropType: string;
  onOpenDisease: (code: string) => void;
  className?: string;
};

/**
 * Result of one image: title + status, the image with its disease regions (tap a box → its detail below), then each
 * disease (link, confidence, category, location, symptoms); no disease → the server message.
 */
export function DiagnosisResultImage({ image, cropType, onOpenDisease, className }: TDiagnosisResultImageProps) {
  const { partLabel } = useCropLabels(cropType);
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const title = `Ảnh ${image.index + 1} · ${partLabel(image.plantPart)}`;
  const region = selectedRegion === null ? undefined : image.regions[selectedRegion];
  const showDiseases = image.status === 'DISEASED' && image.diseases.length > 0;

  return (
    <View accessibilityLabel={title} className={cn('gap-3 rounded-xl border border-border-subtle bg-card p-4', className)}>
      <View className="gap-1">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text className={TEXT.titleSmall}>{title}</Text>
          {image.status && <Badge tone={IMAGE_STATUS_TONES[image.status]} label={IMAGE_STATUS_LABELS[image.status]} />}
        </View>
        {image.detectedPart && image.detectedPart !== image.plantPart && (
          <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
            AI nhận diện đây là {partLabel(image.detectedPart).toLocaleLowerCase('vi-VN')}
          </Text>
        )}
      </View>

      {image.url ? (
        <View style={{ aspectRatio }} className="w-full overflow-hidden rounded-lg bg-surface">
          <Image
            source={{ uri: image.url }}
            contentFit="contain"
            accessibilityLabel={title}
            onLoad={({ source }) => {
              if (source.width > 0 && source.height > 0) setAspectRatio(source.width / source.height);
            }}
            style={StyleSheet.absoluteFill}
          />
          <RegionOverlay regions={image.regions} selectedIndex={selectedRegion} onSelect={setSelectedRegion} />
        </View>
      ) : (
        <View className="aspect-[4/3] items-center justify-center gap-2 rounded-lg bg-surface">
          <Icon name="image-outline" size="lg" color="mutedForeground" />
          <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>Không tải được ảnh</Text>
        </View>
      )}

      {region && (
        <View accessibilityLiveRegion="polite" className="gap-1 rounded-lg bg-surface p-3">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className={TEXT.titleSmall}>{regionName(region)}</Text>
            {region.diagnosis && <ConfidenceBadge level={region.diagnosis.confidence.level} />}
          </View>
          {region.diagnosis?.variantName && (
            <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>{region.diagnosis.diseaseName}</Text>
          )}
          <Text className={TEXT.bodyMedium}>{region.symptom}</Text>
          {region.features.map((feature) => (
            <Text key={feature} className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
              • {feature}
            </Text>
          ))}
        </View>
      )}

      {showDiseases
        ? image.diseases.map((disease) => {
            const regions = regionsOfDisease(image, disease.diseaseCode);
            const symptoms = uniqueSymptoms(regions);
            return (
              <View key={`${disease.diseaseCode}-${disease.variantCode ?? ''}`} className="gap-2 border-t border-border-subtle pt-3">
                <DiseaseNameButton
                  name={disease.diseaseName}
                  variantName={disease.variantName}
                  onPress={() => onOpenDisease(disease.diseaseCode)}
                />
                <View className="flex-row flex-wrap gap-2">
                  <ConfidenceBadge level={disease.confidence.level} />
                  <Badge label={CATEGORY_LABELS[disease.category]} />
                </View>
                <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
                  Vị trí: {formatLocation(image, regions.length, partLabel)}
                </Text>
                {symptoms.length > 0 ? (
                  symptoms.map((symptom) => (
                    <Text key={symptom} className={TEXT.bodySmall}>
                      • {symptom}
                    </Text>
                  ))
                ) : (
                  <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>Không có mô tả triệu chứng</Text>
                )}
              </View>
            );
          })
        : image.message && (
            <View className={cn('rounded-lg px-3 py-2', image.status === 'HEALTHY' ? 'bg-success-subtle' : 'bg-surface')}>
              <Text className={cn(TEXT.bodyMedium, image.status === 'HEALTHY' ? 'text-success' : 'text-foreground')}>
                {image.message}
              </Text>
            </View>
          )}
    </View>
  );
}
