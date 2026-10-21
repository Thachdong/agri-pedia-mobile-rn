import { http } from '@/shared/lib/http';
import type { TTopArticlesResponse } from '../types/article.types';

/** Public. Crops without a published top article are left out; `crops` empty when none were chosen. */
export const getTopArticles = (signal?: AbortSignal) =>
  http.get<TTopArticlesResponse>('/knowledge/articles/top', { signal });
