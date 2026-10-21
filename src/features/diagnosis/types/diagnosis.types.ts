import type { TApiSchema } from '@/shared/lib/http';
import type { TCropPlantPart } from './knowledge.types';

export type TPlantPart = TCropPlantPart['code'];

/** GET /diagnoses/settings — form limits set by admins; `remainingToday` null for a guest. */
export type TDiagnosisSettings = TApiSchema<'DiagnosisFormSettingsResponse'>;

/** Field `meta` (JSON) of POST /diagnoses — one entry per image, same order as the files. */
export type TCreateDiagnosisMeta = {
  cropType: string;
  images: { plantPart: TPlantPart }[];
  note?: string;
};

/** One photo to send — `uri` of a local file already resized (JPEG). */
export type TDiagnosisUploadImage = { uri: string; plantPart: TPlantPart };

export type TCreateDiagnosisInput = {
  cropType: string;
  images: TDiagnosisUploadImage[];
  note?: string;
};
export type TCreateDiagnosisResponse = TApiSchema<'CreateDiagnosisResponse'>;
