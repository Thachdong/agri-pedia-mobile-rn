import { http } from '@/shared/lib/http';
import type { TCropsResponse } from '../types/knowledge.types';

/** Public. Crops enabled for diagnosis, by display order. */
export const getCrops = (signal?: AbortSignal) => http.get<TCropsResponse>('/knowledge/crops', { signal });
