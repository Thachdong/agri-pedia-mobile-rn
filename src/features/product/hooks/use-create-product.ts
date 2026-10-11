import { queryKeys, useAppMutation } from '@/shared/lib/query';
import { createProduct } from '../services/product.service';
import type { TCreateProductInput } from '../types/product.types';

/**
 * Create a product in the caller's shop — it shows (ACTIVE) at the top of the shop's list.
 * `silent`: the form sheet shows errors under its form.
 * @param distributorId the logged-in owner (me.id).
 */
export const useCreateProduct = (distributorId: string) =>
  useAppMutation({
    mutationFn: (input: TCreateProductInput) => createProduct(input),
    invalidates: () => [queryKeys.products.list(distributorId)],
    meta: { silent: true },
  });
