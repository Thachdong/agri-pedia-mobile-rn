// Public API of the `product` feature. Other features and src/app import only this file.
export { categoriesQuery, distributorProductsQuery, productDetailQuery } from './hooks/product.queries';
export { useCategories } from './hooks/use-categories';
export { useDistributorProducts } from './hooks/use-distributor-products';
export { useProductDetail } from './hooks/use-product-detail';
export type {
  TCategory,
  TDistributorProduct,
  TProductDetail,
  TProductMedia,
  TProductStatus,
  TProductUnit,
} from './types/product.types';
