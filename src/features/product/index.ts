// Public API of the `product` feature. Other features and src/app import only this file.
export { ProductCard, type TProductCardProps } from './components/product-card';
export { ProductFormSheet, type TProductFormSheetProps } from './components/product-form-sheet';
export { categoriesQuery, distributorProductsQuery, productDetailQuery } from './hooks/product.queries';
export { useCategories } from './hooks/use-categories';
export { useCreateProduct } from './hooks/use-create-product';
export { useDeleteProduct } from './hooks/use-delete-product';
export { useDistributorProducts } from './hooks/use-distributor-products';
export { useProductDetail } from './hooks/use-product-detail';
export { useUpdateProduct } from './hooks/use-update-product';
export type {
  TCategory,
  TCreateProductInput,
  TDistributorProduct,
  TProductDetail,
  TProductMedia,
  TProductStatus,
  TProductUnit,
  TUpdateProductInput,
  TUpdateProductVariables,
} from './types/product.types';
