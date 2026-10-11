import type { TMediaType } from '@/features/media';
import type { TApiSchema } from '@/shared/lib/http';

/** Item of GET /products — ACTIVE only; `thumbnail` signed URL of the first image (expires) or null. */
export type TDistributorProduct = TApiSchema<'DistributorProductResponse'>;
export type TDistributorProductsPage = TApiSchema<'ListDistributorProductsResponse'>;

/** The spec declares no enum for `type` (generated as `{}`) — in practice IMAGE | VIDEO | FILE, as uploaded. */
export type TProductMedia = Omit<TApiSchema<'ProductMediaResponse'>, 'type'> & { type: TMediaType };

/** GET /products/{id} — any status; `media` ordered by sortOrder, `url` signed (expires). Rating: GET /reviews/summary. */
export type TProductDetail = Omit<TApiSchema<'GetProductDetailResponse'>, 'media'> & { media: TProductMedia[] };
export type TProductStatus = TProductDetail['status'];
export type TProductUnit = TProductDetail['unit'];

export type TCategory = TApiSchema<'CategoryResponse'>;
export type TCategoriesResponse = TApiSchema<'ListCategoriesResponse'>;
