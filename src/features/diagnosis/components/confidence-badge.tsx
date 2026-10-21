import { Badge, type TBadgeTone } from '@/shared/components/atoms';
import { CONFIDENCE_LABELS } from '../constants/diagnosis.constants';
import type { TConfidenceLevel } from '../types/diagnosis.types';

const CONFIDENCE_TONES: Record<TConfidenceLevel, TBadgeTone> = {
  HIGH: 'success',
  MEDIUM: 'warning',
  LOW: 'neutral',
};

/** AI confidence: Cao (green) / Trung bình (amber) / Thấp (grey). `score` not shown (not calibrated) — same as web. */
export function ConfidenceBadge({ level, className }: { level: TConfidenceLevel; className?: string }) {
  return <Badge tone={CONFIDENCE_TONES[level]} label={`Tin cậy: ${CONFIDENCE_LABELS[level]}`} className={className} />;
}
