import type { TApiSchema } from '@/shared/lib/http';

/** Crop supported by diagnosis — `code` is the `cropType` of POST /diagnoses (e.g. RICE). */
export type TCrop = TApiSchema<'CropItemResponse'>;
export type TCropsResponse = TApiSchema<'ListCropsResponse'>;
/** A part a photo of the crop may show — valid `plantPart` of POST /diagnoses, in dropdown order. */
export type TCropPlantPart = TApiSchema<'CropPlantPartResponse'>;

/** GET /knowledge/diseases/{code} — `verification` ≠ SOURCED = not confirmed by an expert. */
export type TDisease = TApiSchema<'DiseaseDetailResponse'>;
export type TDiseaseCategory = TDisease['category'];
export type TDiseaseAgentType = TDisease['agentType'];
export type TCropStage = TDisease['cropStages'][number];
