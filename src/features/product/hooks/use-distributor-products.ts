import { useAppInfiniteQuery } from '@/shared/lib/query';
import type { TDistributorProduct, TDistributorProductsPage } from '../types/product.types';
import { distributorProductsQuery } from './product.queries';

const toItems = ({ pages }: { pages: TDistributorProductsPage[] }): TDistributorProduct[] =>
  pages.flatMap((page) => page.products);

/** Tab "Sản Phẩm": ACTIVE products of a shop (infinite), all loaded pages merged. */
export const useDistributorProducts = (distributorId: string) =>
  useAppInfiniteQuery({ ...distributorProductsQuery(distributorId), select: toItems });
