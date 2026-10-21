import type {
  TConfidenceLevel,
  TDiagnosisImageStatus,
  TDiagnosisStatus,
  TPlantPart,
} from '../types/diagnosis.types';
import type { TCropStage, TDiseaseAgentType, TDiseaseCategory } from '../types/knowledge.types';

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
  notFound: 'DIAGNOSIS_NOT_FOUND',
} as const;

export const IMAGE_DECODE_ERROR = 'Không đọc được ảnh này, hãy chọn ảnh khác';

/** Waiting for a result: realtime `diagnosis.completed`, else poll every 3s while PROCESSING, give up after 5 min. */
export const DIAGNOSIS_EVENTS = { completed: 'diagnosis.completed' } as const;
export const POLL_INTERVAL_MS = 3_000;
export const POLL_TIMEOUT_MS = 5 * 60_000;

/** Generic labels (fallback) — the crop's own labels come from GET /knowledge/crops (useCropLabels). Same as web. */
export const PLANT_PART_LABELS: Record<TPlantPart, string> = {
  LEAF: 'Lá',
  SHEATH: 'Bẹ lá',
  STEM: 'Thân',
  PANICLE: 'Bông',
  SHOOT: 'Đọt / lá non',
  BRANCH: 'Cành',
  TRUNK: 'Thân cây',
  COLLAR: 'Gốc / cổ rễ',
  ROOT: 'Rễ',
  FLOWER: 'Hoa',
  FRUIT: 'Trái',
  ARIL: 'Múi / cơm',
  WHOLE_PLANT: 'Cả cây',
};

export const CROP_STAGE_LABELS: Record<TCropStage, string> = {
  SEEDLING: 'Cây con / mạ',
  TILLERING: 'Đẻ nhánh',
  BOOTING: 'Làm đòng',
  HEADING: 'Trổ bông',
  MILK: 'Ngậm sữa',
  MATURITY: 'Chín',
  YOUNG_TREE: 'Kiến thiết cơ bản',
  FLUSHING: 'Ra đọt (lộc non)',
  FLOWERING: 'Ra hoa',
  FRUIT_SET: 'Đậu trái / trái non',
  FRUIT_DEVELOPMENT: 'Nuôi trái',
  HARVEST: 'Thu hoạch',
  TREE_RECOVERY: 'Phục hồi cây sau thu hoạch',
};

export const CONFIDENCE_LABELS: Record<TConfidenceLevel, string> = {
  HIGH: 'Cao',
  MEDIUM: 'Trung bình',
  LOW: 'Thấp',
};

export const CATEGORY_LABELS: Record<TDiseaseCategory, string> = {
  DISEASE: 'Bệnh',
  PEST: 'Sâu hại',
  DISORDER: 'Rối loạn dinh dưỡng – sinh lý',
};

export const DIAGNOSIS_STATUS_LABELS: Record<TDiagnosisStatus, string> = {
  PROCESSING: 'Đang phân tích',
  COMPLETED: 'Hoàn tất',
  FAILED: 'Lỗi',
};

export const IMAGE_STATUS_LABELS: Record<TDiagnosisImageStatus, string> = {
  DISEASED: 'Có dấu hiệu bệnh',
  HEALTHY: 'Khoẻ mạnh',
  UNCERTAIN: 'Chưa xác định',
  NOT_TARGET_CROP: 'Không phải cây cần chẩn đoán',
  LOW_QUALITY: 'Ảnh chưa đủ rõ',
};

export const AGENT_TYPE_LABELS: Record<TDiseaseAgentType, string> = {
  FUNGUS: 'Nấm',
  OOMYCETE: 'Nấm noãn (Oomycete)',
  ALGA: 'Tảo',
  BACTERIA: 'Vi khuẩn',
  VIRUS: 'Virus',
  NEMATODE: 'Tuyến trùng',
  INSECT: 'Côn trùng',
  MITE: 'Nhện hại',
  MOLLUSC: 'Động vật thân mềm',
  VERTEBRATE: 'Động vật có xương sống',
  NUTRIENT: 'Dinh dưỡng',
  ABIOTIC: 'Phi sinh học',
  COMPLEX: 'Phức hợp',
  UNKNOWN: 'Chưa rõ',
};
