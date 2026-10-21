import type { TApiSchema } from '@/shared/lib/http';
import type { TCropPlantPart, TDiseaseCategory } from './knowledge.types';

export type TPlantPart = TCropPlantPart['code'];

type TApiDiagnosis = TApiSchema<'GetDiagnosisResponse'>;
type TApiDiagnosisImage = TApiSchema<'DiagnosisImageResponse'>;
type TApiDiagnosisSummary = TApiSchema<'DiagnosisSummaryResponse'>;

export type TDiagnosisStatus = TApiDiagnosis['status'];
/** Conclusion of one image — null while the diagnosis is PROCESSING. */
export type TDiagnosisImageStatus = NonNullable<TApiDiagnosisImage['status']>;
export type TConfidenceLevel = TApiSchema<'DiagnosisConfidenceResponse'>['level'];

/** The spec generates `category` as `{}` → the knowledge enum instead. */
type TWithCategory<T> = Omit<T, 'category'> & { category: TDiseaseCategory };

export type TDiagnosisImageDisease = TWithCategory<TApiSchema<'DiagnosisImageDiseaseResponse'>>;
export type TDiagnosisSummaryDisease = TWithCategory<TApiSchema<'DiagnosisSummaryDiseaseResponse'>>;
/** `box` 0..1 on the image at `url` (EXIF-rotated); `diagnosis` null = uncertain region. */
export type TDiagnosisRegion = TApiSchema<'DiagnosisRegionResponse'>;

export type TDiagnosisSummary = Omit<TApiDiagnosisSummary, 'diseases'> & { diseases: TDiagnosisSummaryDisease[] };
export type TDiagnosisImage = Omit<TApiDiagnosisImage, 'diseases'> & { diseases: TDiagnosisImageDisease[] };

/** GET /diagnoses/{id} — PROCESSING: `summary` null, `images[].status` null, `regions` empty. */
export type TDiagnosis = Omit<TApiDiagnosis, 'summary' | 'images'> & {
  summary: TDiagnosisSummary | null;
  images: TDiagnosisImage[];
};

/** Realtime `diagnosis.completed`. */
export type TDiagnosisCompletedEvent = { id: string; status: Exclude<TDiagnosisStatus, 'PROCESSING'> };

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

/** One photo slot of the form — `id` keys the slot, `plantPart` '' = not chosen (DEFAULT_PLANT_PART is sent). */
export type TDiagnosisFormImage = { id: string; uri: string; plantPart: TPlantPart | '' };

export type TDiagnosisFormValues = { images: TDiagnosisFormImage[]; note: string };

/** Resolver context — image count limit from GET /diagnoses/settings (`maxImages`). */
export type TDiagnosisFormContext = { maxImages: number };
