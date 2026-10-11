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

/** Body of POST /products — `media` (1..10) are files uploaded to TMP (TUploadedMedia + optional sortOrder). */
export type TCreateProductInput = TApiSchema<'CreateProductDto'>;
export type TCreateProductResponse = TApiSchema<'CreateProductResponse'>;

/** Body of PATCH /products/{id} — omitted fields keep their value (never `null`); `addMedia` / `removeMediaIds` 0..10. */
export type TUpdateProductInput = TApiSchema<'UpdateProductDto'>;
export type TUpdateProductVariables = { productId: string; input: TUpdateProductInput };
