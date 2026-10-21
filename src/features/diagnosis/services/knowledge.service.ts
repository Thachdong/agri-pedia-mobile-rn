import { http } from '@/shared/lib/http';
import type { TCropsResponse, TDisease } from '../types/knowledge.types';

/** Public. Crops enabled for diagnosis, by display order. */
export const getCrops = (signal?: AbortSignal) => http.get<TCropsResponse>('/knowledge/crops', { signal });

/** Public. Vietnamese detail of a disease; unknown code → 404 KNOWLEDGE_DISEASE_NOT_FOUND. */
export const getDisease = (code: string, signal?: AbortSignal) =>
  http.get<TDisease>(`/knowledge/diseases/${encodeURIComponent(code)}`, { signal });
