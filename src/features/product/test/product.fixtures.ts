import type { TPickedFile } from '@/shared/lib/device';
import type { TDistributorProduct, TDistributorProductsPage, TProductDetail } from '../types/product.types';

/** One item of GET /products. */
export const distributorProduct = (overrides: Partial<TDistributorProduct> = {}): TDistributorProduct => ({
  id: 'p1',
  name: 'Lúa giống OM18',
  price: 150000,
  quantity: 120,
  unit: 'kg',
  thumbnail: 'https://cdn.example.com/p1.jpg',
  distributorId: 'd1',
  distributorName: 'Đại lý Minh Phát',
  ...overrides,
});

export const distributorProductsPage = (overrides: Partial<TDistributorProductsPage> = {}): TDistributorProductsPage => ({
  products: [distributorProduct()],
  nextCursor: null,
  ...overrides,
});

/** GET /products/{id} body. */
export const productDetail = (overrides: Partial<TProductDetail> = {}): TProductDetail => ({
  id: 'p1',
  name: 'Lúa giống OM18',
  description: 'Giống lúa ngắn ngày',
  price: 150000,
  quantity: 120,
  unit: 'kg',
  categoryId: 'c1',
  status: 'ACTIVE',
  distributorId: 'd1',
  media: [
    { id: 'm1', type: 'IMAGE', url: 'https://cdn.example.com/m1.jpg' },
    { id: 'm2', type: 'IMAGE', url: 'https://cdn.example.com/m2.jpg' },
  ],
  ...overrides,
});

/** A picked local image. */
export const pickedImage = (name = 'a', overrides: Partial<TPickedFile> = {}): TPickedFile => ({
  uri: `file:///cache/${name}.jpg`,
  name: `${name}.jpg`,
  mimeType: 'image/jpeg',
  size: 1000,
  extension: 'jpg',
  ...overrides,
});
