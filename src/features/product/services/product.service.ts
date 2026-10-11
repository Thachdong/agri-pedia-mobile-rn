import { http } from '@/shared/lib/http';
import type {
  TCategoriesResponse,
  TCreateProductInput,
  TCreateProductResponse,
  TDistributorProductsPage,
  TProductDetail,
  TUpdateProductInput,
} from '../types/product.types';

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

/**
 * ACTIVE DISTRIBUTOR only (403 PRODUCT_SELLER_NOT_ALLOWED); unknown category → 404 PRODUCT_CATEGORY_NOT_FOUND;
 * 400 PRODUCT_INVALID_PRICE / _QUANTITY. Created ACTIVE; media that can't be attached are skipped silently.
 */
export const createProduct = (input: TCreateProductInput) => http.post<TCreateProductResponse>('/products', input);

/** Seller only (403 PRODUCT_SELLER_NOT_ALLOWED / PRODUCT_NOT_OWNER); deleted → 404 PRODUCT_NOT_FOUND. Empty body. */
export const updateProduct = (productId: string, input: TUpdateProductInput) =>
  http.patch<void>(productPath(productId), input);

/** Soft delete, seller only (403 PRODUCT_SELLER_NOT_ALLOWED / PRODUCT_NOT_OWNER); deleted → 404 PRODUCT_NOT_FOUND. Empty body. */
export const deleteProduct = (productId: string) => http.delete<void>(productPath(productId));
