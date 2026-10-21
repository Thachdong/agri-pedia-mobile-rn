import { isAppError } from '@/shared/lib/http';

const PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND';

/** GET /products/{id} answered "deleted / unknown product" — a final state, retrying won't help. */
export const isProductNotFound = (error: unknown) =>
  isAppError(error) && (error.code === PRODUCT_NOT_FOUND || error.status === 404);
