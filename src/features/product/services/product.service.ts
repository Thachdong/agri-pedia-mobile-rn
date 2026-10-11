import { http } from '@/shared/lib/http';
import type { TCategoriesResponse, TDistributorProductsPage, TProductDetail } from '../types/product.types';

const productPath = (productId: string) => `/products/${encodeURIComponent(productId)}`;

/** Public — ACTIVE products of a shop, newest first. Not a DISTRIBUTOR → 404 PRODUCT_DISTRIBUTOR_NOT_FOUND; 400 PRODUCT_INVALID_CURSOR. */
export const getDistributorProducts = (
  params: { distributorId: string; cursor?: string; limit?: number },
  signal?: AbortSignal,
) => http.get<TDistributorProductsPage>('/products', { query: params, signal });

/** Public — a product in any status; deleted → 404 PRODUCT_NOT_FOUND. */
export const getProductDetail = (productId: string, signal?: AbortSignal) =>
  http.get<TProductDetail>(productPath(productId), { signal });

/** Public — product categories ordered by name. */
export const getCategories = (signal?: AbortSignal) => http.get<TCategoriesResponse>('/categories', { signal });
