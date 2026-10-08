import { http } from '@/shared/lib/http';
import type { TListProvincesResponse, TListWardsResponse } from '../types/location.types';

export const getProvinces = (signal?: AbortSignal) => http.get<TListProvincesResponse>('/provinces', { signal });

export const getWards = (provinceCode: string, signal?: AbortSignal) =>
  http.get<TListWardsResponse>(`/provinces/${encodeURIComponent(provinceCode)}/wards`, { signal });
