import { queryKeys, useAppMutation } from '@/shared/lib/query';
import { deleteProduct } from '../services/product.service';

/**
 * Delete a product of the caller's shop. Stale: the shop's list; the detail cache is dropped (a refetch would 404).
 * Reviews of a deleted product stay in GET /reviews → reviews untouched. `silent`: the confirm sheet shows the error.
 * @param distributorId the logged-in owner (me.id).
 */
export const useDeleteProduct = (distributorId: string) =>
  useAppMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    invalidates: () => [queryKeys.products.list(distributorId)],
    onSuccess: (_data, productId, _onMutateResult, { client }) => {
      client.removeQueries({ queryKey: queryKeys.products.detail(productId) });
    },
    meta: { silent: true },
  });
