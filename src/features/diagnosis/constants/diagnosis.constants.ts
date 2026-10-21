import type { TPlantPart } from '../types/diagnosis.types';

/** Fallbacks while GET /diagnoses/settings is missing — the server defaults. */
export const DIAGNOSIS_MAX_IMAGES = 5;
export const DIAGNOSIS_IMAGE_LIMITS = { maxWidth: 4096, maxHeight: 4096, maxBytes: 5 * 1024 * 1024 } as const;
export const DIAGNOSIS_NOTE_MAX = 1000;

/** Admins chose no default crop (or it is not enabled any more) → this one, then the first crop. */
export const FALLBACK_CROP = 'RICE';

/** Server requires a plantPart per image — none chosen → "Cả cây" (the AI finds the part), else the crop's first part. */
export const DEFAULT_PLANT_PART = 'WHOLE_PLANT' satisfies TPlantPart;

/** Domain error codes of POST /diagnoses the form reacts to (messages live in the central error map). */
export const DIAGNOSIS_ERROR_CODE = {
  invalidImage: 'DIAGNOSIS_INVALID_IMAGE',
  cropNotSupported: 'DIAGNOSIS_CROP_NOT_SUPPORTED',
  dailyLimitExceeded: 'DIAGNOSIS_DAILY_LIMIT_EXCEEDED',
} as const;

export const IMAGE_DECODE_ERROR = 'Không đọc được ảnh này, hãy chọn ảnh khác';
