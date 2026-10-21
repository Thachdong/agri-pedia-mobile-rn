import { DEFAULT_PLANT_PART, FALLBACK_CROP } from '../constants/diagnosis.constants';
import type { TPlantPart } from '../types/diagnosis.types';
import type { TCrop } from '../types/knowledge.types';

/** Crop preselected on the form: admins' default → RICE → the first crop; no crop → undefined. */
export const pickDefaultCrop = (crops: readonly TCrop[], preferred: string | null | undefined): TCrop | undefined =>
  [preferred, FALLBACK_CROP].map((code) => crops.find((crop) => crop.code === code)).find(Boolean) ?? crops[0];

/** Part sent for an image without a choice — "Cả cây" when the crop has it, else its first part. */
export const fallbackPlantPart = (crop: Pick<TCrop, 'plantParts'>): TPlantPart =>
  crop.plantParts.some((part) => part.code === DEFAULT_PLANT_PART)
    ? DEFAULT_PLANT_PART
    : (crop.plantParts[0]?.code ?? DEFAULT_PLANT_PART);

/** Indexes of DIAGNOSIS_INVALID_IMAGE `details.images` — `null` = a general error (file count, parts...). */
export const invalidImageIndexes = (details: unknown): (number | null)[] => {
  const images = (details as { images?: { index: number | null }[] } | undefined)?.images;
  return Array.isArray(images) ? images.map((image) => image.index) : [];
};
