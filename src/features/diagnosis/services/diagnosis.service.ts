import { http } from '@/shared/lib/http';
import type {
  TCreateDiagnosisInput,
  TCreateDiagnosisMeta,
  TCreateDiagnosisResponse,
  TDiagnosisSettings,
} from '../types/diagnosis.types';

/** Public (token optional) — form settings set by admins + diagnoses the caller may still send today. */
export const getDiagnosisSettings = (signal?: AbortSignal) =>
  http.get<TDiagnosisSettings>('/diagnoses/settings', { signal });

/**
 * multipart: `images` (1..maxImages files, same order as `meta.images`) + `meta` JSON. RN file part = { uri, name, type }.
 * 202 `{ id, status: PROCESSING }` — the result comes via realtime / polling GET /diagnoses/{id}.
 */
export const createDiagnosis = ({ cropType, images, note }: TCreateDiagnosisInput) => {
  const meta: TCreateDiagnosisMeta = { cropType, images: images.map(({ plantPart }) => ({ plantPart })), note };
  const form = new FormData();
  images.forEach(({ uri }, index) =>
    form.append('images', { uri, name: `image-${index}.jpg`, type: 'image/jpeg' } as unknown as Blob),
  );
  form.append('meta', JSON.stringify(meta));
  return http.post<TCreateDiagnosisResponse>('/diagnoses', form);
};
