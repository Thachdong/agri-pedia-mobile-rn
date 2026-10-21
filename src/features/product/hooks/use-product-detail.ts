import { useAppQuery } from '@/shared/lib/query';
import { productDetailQuery } from './product.queries';

export const useProductDetail = (productId: string) => useAppQuery(productDetailQuery(productId));
