import type { TDiagnosisSettings } from '../types/diagnosis.types';
import type { TCrop } from '../types/knowledge.types';

/** One crop of GET /knowledge/crops. */
export const crop = (overrides: Partial<TCrop> = {}): TCrop => ({
  code: 'RICE',
  nameVi: 'Lúa',
  plantParts: [
    { code: 'LEAF', nameVi: 'Lá' },
    { code: 'WHOLE_PLANT', nameVi: 'Cả cây' },
  ],
  cropStages: [],
  ...overrides,
});

export const durian = (overrides: Partial<TCrop> = {}): TCrop =>
  crop({ code: 'DURIAN', nameVi: 'Sầu riêng', plantParts: [{ code: 'FRUIT', nameVi: 'Trái' }], ...overrides });

/** GET /diagnoses/settings. */
export const diagnosisSettings = (overrides: Partial<TDiagnosisSettings> = {}): TDiagnosisSettings => ({
  defaultCropType: null,
  minImages: 1,
  maxImages: 3,
  maxImageBytes: 5_000_000,
  maxImageWidth: 4096,
  maxImageHeight: 4096,
  remainingToday: 2,
  ...overrides,
});
