import type { TDiagnosisImage, TDiagnosisRegion, TPlantPart } from '../types/diagnosis.types';

/** Plant part label of the crop — `useCropLabels(cropType).partLabel`. */
type TPartLabel = (code: TPlantPart) => string;

const UNCERTAIN_REGION_NAME = 'Chưa xác định';

/** Regions of one disease on an image (by diseaseCode). */
export const regionsOfDisease = (image: Pick<TDiagnosisImage, 'regions'>, diseaseCode: string) =>
  image.regions.filter((region) => region.diagnosis?.diseaseCode === diseaseCode);

/** Symptoms without duplicates, in order of appearance. */
export const uniqueSymptoms = (regions: readonly TDiagnosisRegion[]) => [...new Set(regions.map((region) => region.symptom))];

/** Part of the image — the part the AI detected first, else the one the user chose. */
export const imagePartLabel = (
  { plantPart, detectedPart }: Pick<TDiagnosisImage, 'plantPart' | 'detectedPart'>,
  partLabel: TPartLabel,
) => partLabel(detectedPart ?? plantPart);

/** "Lá · 2 vùng" / "Lá · không khoanh vùng". */
export const formatLocation = (
  image: Pick<TDiagnosisImage, 'plantPart' | 'detectedPart'>,
  regionCount: number,
  partLabel: TPartLabel,
) => `${imagePartLabel(image, partLabel)} · ${regionCount > 0 ? `${regionCount} vùng` : 'không khoanh vùng'}`;

/** Name shown on a region: variant, else disease; no diagnosis → "Chưa xác định". */
export const regionName = ({ diagnosis }: Pick<TDiagnosisRegion, 'diagnosis'>) =>
  diagnosis ? (diagnosis.variantName ?? diagnosis.diseaseName) : UNCERTAIN_REGION_NAME;

/** Images in the order they were sent. */
export const sortedImages = <T extends Pick<TDiagnosisImage, 'index'>>(images: readonly T[]) =>
  [...images].sort((a, b) => a.index - b.index);

/** Web article path `/benh-cay-trong/<cropSlug>/<slug>` → its parts (the app opens its own screen); else null. */
export const articlePathParts = (path: string): { cropSlug: string; slug: string } | null => {
  const [, cropSlug, slug] = path.split('/').filter(Boolean);
  return cropSlug && slug ? { cropSlug, slug } : null;
};

/** "20/10/2026 14:30" in the device time zone. */
export const formatDiagnosisTime = (iso: string) => {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
