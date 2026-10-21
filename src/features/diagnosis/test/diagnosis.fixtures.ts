import type { TDiagnosis, TDiagnosisImage, TDiagnosisRegion, TDiagnosisSettings } from '../types/diagnosis.types';
import type { TCrop, TDisease } from '../types/knowledge.types';

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

/** One region of a diagnosed image (blast, high confidence). */
export const diagnosisRegion = (overrides: Partial<TDiagnosisRegion> = {}): TDiagnosisRegion => ({
  box: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 },
  symptom: 'Vết hình thoi màu nâu',
  features: ['Tâm xám', 'Viền nâu'],
  diagnosis: {
    diseaseCode: 'RICE_BLAST',
    variantCode: null,
    diseaseName: 'Đạo ôn',
    variantName: null,
    confidence: { level: 'HIGH', score: 0.9 },
  },
  ...overrides,
});

export const diagnosisImage = (overrides: Partial<TDiagnosisImage> = {}): TDiagnosisImage => ({
  index: 0,
  mediaId: 'm1',
  url: 'https://cdn.test/1.jpg',
  plantPart: 'LEAF',
  detectedPart: 'LEAF',
  status: 'DISEASED',
  message: null,
  diseases: [
    {
      category: 'DISEASE',
      diseaseCode: 'RICE_BLAST',
      variantCode: null,
      diseaseName: 'Đạo ôn',
      variantName: null,
      confidence: { level: 'HIGH', score: 0.9 },
    },
  ],
  regions: [diagnosisRegion()],
  ...overrides,
});

/** GET /diagnoses/{id} — COMPLETED with one diseased image by default. */
export const diagnosis = (overrides: Partial<TDiagnosis> = {}): TDiagnosis => ({
  id: 'g1',
  status: 'COMPLETED',
  cropType: 'RICE',
  note: 'Lá vàng',
  summary: {
    hasDisease: true,
    conflict: false,
    diseases: [
      {
        diseaseCode: 'RICE_BLAST',
        diseaseName: 'Đạo ôn',
        category: 'DISEASE',
        confidence: { level: 'HIGH', score: 0.9 },
        imageCount: 1,
      },
    ],
  },
  images: [diagnosisImage()],
  userFeedback: null,
  disclaimer: 'Kết quả chỉ mang tính tham khảo.',
  createdAt: '2026-10-20T07:30:00.000Z',
  completedAt: '2026-10-20T07:30:20.000Z',
  ...overrides,
});

export const processingDiagnosis = (overrides: Partial<TDiagnosis> = {}): TDiagnosis =>
  diagnosis({
    status: 'PROCESSING',
    summary: null,
    images: [diagnosisImage({ status: null, diseases: [], regions: [], detectedPart: null })],
    completedAt: null,
    ...overrides,
  });

/** GET /knowledge/diseases/{code}. */
export const disease = (overrides: Partial<TDisease> = {}): TDisease => ({
  code: 'RICE_BLAST',
  nameVi: 'Đạo ôn',
  nameEn: 'Rice blast',
  scientificName: 'Magnaporthe oryzae',
  aliases: ['Cháy lá'],
  category: 'DISEASE',
  agentType: 'FUNGUS',
  affectedParts: ['LEAF'],
  pathogens: ['Nấm Magnaporthe oryzae'],
  symptoms: ['Vết hình thoi'],
  variants: [],
  transmissionMode: null,
  cropStages: ['TILLERING'],
  favorableConditions: [],
  treatments: { cultural: ['Bón phân cân đối'], biological: [], nutrition: [] },
  similarDiseases: [],
  references: [],
  verification: 'SOURCED',
  kbVersion: '1',
  article: { path: '/benh-cay-trong/lua/dao-on', status: 'REVIEWED' },
  ...overrides,
});
