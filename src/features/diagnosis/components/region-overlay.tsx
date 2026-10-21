import { Pressable, Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { CONFIDENCE_LABELS } from '../constants/diagnosis.constants';
import type { TConfidenceLevel, TDiagnosisRegion } from '../types/diagnosis.types';
import { regionName } from '../utils/diagnosis-view.util';

/** Box + label by confidence; uncertain region = grey dashed. Same tones as web. */
const BOX_TONES: Record<TConfidenceLevel | 'UNCERTAIN', { box: string; label: string; text: string }> = {
  HIGH: { box: 'border-success', label: 'bg-success', text: 'text-success-foreground' },
  MEDIUM: { box: 'border-warning', label: 'bg-warning', text: 'text-warning-foreground' },
  LOW: { box: 'border-muted-foreground', label: 'bg-muted-foreground', text: 'text-background' },
  UNCERTAIN: { box: 'border-dashed border-muted-foreground', label: 'bg-muted-foreground', text: 'text-background' },
};

const toPercent = (value: number) => `${Math.min(Math.max(value, 0), 1) * 100}%` as const;

export type TRegionOverlayProps = {
  regions: readonly TDiagnosisRegion[];
  /** Index of the selected region (its detail shows under the image); others dimmed. */
  selectedIndex?: number | null;
  onSelect?: (index: number | null) => void;
  className?: string;
};

/**
 * Over the image (parent sized exactly as the image): one box per region (`box` 0..1 → %), scales with the image.
 * Tap a box → select it (tap again → unselect).
 */
export function RegionOverlay({ regions, selectedIndex = null, onSelect, className }: TRegionOverlayProps) {
  return (
    <View pointerEvents="box-none" className={cn('absolute inset-0', className)}>
      {regions.map((region, index) => {
        const { box, diagnosis } = region;
        const tone = BOX_TONES[diagnosis?.confidence.level ?? 'UNCERTAIN'];
        const name = regionName(region);
        const selected = selectedIndex === index;
        const dimmed = selectedIndex !== null && !selected;
        const confidence = diagnosis ? `, tin cậy ${CONFIDENCE_LABELS[diagnosis.confidence.level].toLowerCase()}` : '';

        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={`Vùng ${index + 1}: ${name}${confidence}`}
            accessibilityState={{ selected }}
            onPress={() => onSelect?.(selected ? null : index)}
            style={{ left: toPercent(box.x), top: toPercent(box.y), width: toPercent(box.w), height: toPercent(box.h) }}
            className={cn('absolute rounded-sm border-2', tone.box, selected && 'border-4', dimmed && 'opacity-40')}
          >
            <View className={cn('absolute -top-5 left-0 max-w-40 rounded-sm px-1', tone.label)}>
              <Text numberOfLines={1} className={cn('text-2xs font-medium', tone.text)}>
                {name}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
