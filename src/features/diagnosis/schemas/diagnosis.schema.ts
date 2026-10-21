import { schema, v } from '@/shared/lib/validation';
import { DIAGNOSIS_MAX_IMAGES, DIAGNOSIS_NOTE_MAX } from '../constants/diagnosis.constants';
import type { TDiagnosisFormContext, TDiagnosisFormImage, TDiagnosisFormValues } from '../types/diagnosis.types';

const diagnosisImage = schema<TDiagnosisFormImage>({
  id: v.string().required(),
  uri: v.string().required(),
  // Optional in the form — empty sends DEFAULT_PLANT_PART; the slot only offers the crop's parts.
  plantPart: v.string().allow('').required(),
});

/**
 * Mirrors POST /diagnoses meta (same rules as web): 1..`maxImages` images (resolver context, default
 * DIAGNOSIS_MAX_IMAGES), note ≤ 1000. Format / bytes / pixel limits are handled by resizeImage before sending.
 */
export const diagnosisFormSchema = schema<TDiagnosisFormValues>({
  images: v
    .array()
    .items(diagnosisImage)
    .min(1)
    // Not `.max(v.ref('$maxImages'))`: the message would show the ref name instead of the number.
    .custom((images: unknown[], helpers) => {
      const { maxImages } = (helpers.prefs.context ?? {}) as Partial<TDiagnosisFormContext>;
      const limit = maxImages ?? DIAGNOSIS_MAX_IMAGES;
      return images.length > limit ? helpers.error('array.max', { limit }) : images;
    })
    .required()
    .messages({
      'array.min': 'Thêm ít nhất 1 ảnh',
      'array.max': 'Tối đa {#limit} ảnh',
    }),
  note: v
    .string()
    .trim()
    .allow('')
    .max(DIAGNOSIS_NOTE_MAX)
    .messages({ 'string.max': `Ghi chú tối đa ${DIAGNOSIS_NOTE_MAX} ký tự` }),
});
