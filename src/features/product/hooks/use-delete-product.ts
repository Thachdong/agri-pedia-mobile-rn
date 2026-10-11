import { queryKeys, useAppMutation } from '@/shared/lib/query';
import { deleteProduct } from '../services/product.service';

/**
 * Delete a product of the caller's shop. Stale: the shop's list. The detail is only marked stale (no refetch now):
 * the detail screen being left keeps its data instead of flashing a 404; the next open refetches → not found.
 * Reviews of a deleted product stay in GET /reviews → reviews untouched. `silent`: the confirm sheet shows the error.
 * @param distributorId the logged-in owner (me.id).
 */
export const useDeleteProduct = (distributorId: string) =>
  useAppMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    invalidates: () => [queryKeys.products.list(distributorId)],
    onSuccess: (_data, productId, _onMutateResult, { client }) =>
      client.invalidateQueries({ queryKey: queryKeys.products.detail(productId), refetchType: 'none' }),
    meta: { silent: true },
  });
