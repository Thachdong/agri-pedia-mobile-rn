import type { TMediaFile, TUploadedMedia } from '@/features/media';
import type { TPickedFile } from '@/shared/lib/device';
import type {
  TCreateProductInput,
  TProductDetail,
  TProductFormValues,
  TUpdateProductInput,
} from '../types/product.types';

/** Typed decimal (`12,5` or `12.5`) → number. */
export const parseDecimal = (text: string) => Number(text.trim().replace(',', '.'));

/** Empty create form (M8). */
export const EMPTY_PRODUCT_FORM: TProductFormValues = {
  name: '',
  description: '',
  price: '',
  quantity: '',
  categoryId: '',
  unit: '',
  status: 'ACTIVE',
  keptMediaIds: [],
  images: [],
};

/** Edit form (M9) prefilled from the detail; every current image (any media type) starts as kept. */
export const toProductFormValues = (product: TProductDetail): TProductFormValues => ({
  name: product.name,
  description: product.description,
  price: String(product.price),
  quantity: String(product.quantity),
  categoryId: product.categoryId,
  unit: product.unit,
  status: product.status,
  keptMediaIds: product.media.map((media) => media.id),
  images: [],
});

/** New picked images → upload input (all IMAGE). */
export const toImageUploads = (images: TPickedFile[]): TMediaFile<'IMAGE'>[] =>
  images.map((file) => ({ file, type: 'IMAGE' }));

/** Shared fields of create / update (validated values: unit chosen, numbers well formed). */
const toBaseInput = (values: TProductFormValues) => ({
  name: values.name.trim(),
  description: values.description.trim(),
  price: parseDecimal(values.price),
  quantity: Number(values.quantity.trim()),
  categoryId: values.categoryId,
  unit: values.unit as TCreateProductInput['unit'],
});

/** POST /products body — `uploaded` = the new images uploaded to TMP, in pick order. */
export const toCreateProductInput = (values: TProductFormValues, uploaded: TUploadedMedia[]): TCreateProductInput => ({
  ...toBaseInput(values),
  media: uploaded.map((media, sortOrder) => ({ ...media, sortOrder })),
});

/**
 * PATCH /products/{id} body — current images not kept → `removeMediaIds`; new uploads → `addMedia` after the kept ones.
 * Empty media lists are omitted.
 */
export const toUpdateProductInput = (
  values: TProductFormValues,
  product: TProductDetail,
  uploaded: TUploadedMedia[],
): TUpdateProductInput => {
  const kept = new Set(values.keptMediaIds);
  const removeMediaIds = product.media.filter((media) => !kept.has(media.id)).map((media) => media.id);
  const addMedia = uploaded.map((media, index) => ({ ...media, sortOrder: kept.size + index }));
  return {
    ...toBaseInput(values),
    status: values.status,
    ...(addMedia.length > 0 && { addMedia }),
    ...(removeMediaIds.length > 0 && { removeMediaIds }),
  };
};
