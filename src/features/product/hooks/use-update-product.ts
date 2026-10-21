import { queryKeys, useAppMutation } from '@/shared/lib/query';
import { updateProduct } from '../services/product.service';
import type { TUpdateProductVariables } from '../types/product.types';

/**
 * Edit a product of the caller's shop. Stale: its detail + the shop's list (name / price / thumbnail change; a status
 * other than ACTIVE drops it from the list). `silent`: the form sheet shows errors under its form.
 * @param distributorId the logged-in owner (me.id).
 */
export const useUpdateProduct = (distributorId: string) =>
  useAppMutation({
    mutationFn: ({ productId, input }: TUpdateProductVariables) => updateProduct(productId, input),
    invalidates: ({ productId }) => [queryKeys.products.detail(productId), queryKeys.products.list(distributorId)],
    meta: { silent: true },
  });
