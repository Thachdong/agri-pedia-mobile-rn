import { pickedImage } from '../test/product.fixtures';
import type { TProductFormValues } from '../types/product.types';
import { productFormSchema } from './product.schema';

const valid: TProductFormValues = {
  name: 'Lúa giống',
  description: 'Mô tả',
  price: '150000',
  quantity: '10',
  categoryId: 'c1',
  unit: 'kg',
  status: 'ACTIVE',
  keptMediaIds: [],
  images: [pickedImage()],
};
const errors = (values: Partial<TProductFormValues>) =>
  productFormSchema.validate({ ...valid, ...values }, { abortEarly: false }).error?.details ?? [];
const errorPaths = (values: Partial<TProductFormValues>) => errors(values).map((d) => d.path.join('.'));

describe('productFormSchema', () => {
  it('valid create', () => {
    expect(errorPaths({})).toEqual([]);
  });

  it('name 1..255 and description 1..5000 after trim', () => {
    expect(errorPaths({ name: '  ' })).toContain('name');
    expect(errorPaths({ name: 'a'.repeat(256) })).toContain('name');
    expect(errorPaths({ description: '' })).toContain('description');
    expect(errorPaths({ description: 'a'.repeat(5001) })).toContain('description');
  });

  it('price ≥ 0, at most 2 decimals (. or ,), not above the max', () => {
    for (const price of ['0', '12.5', '12,55', '999999999999.99']) expect(errorPaths({ price })).toEqual([]);
    for (const price of ['', '-1', '1.234', 'abc', '1000000000000']) expect(errorPaths({ price })).toContain('price');
  });

  it('quantity integer 0..2147483647', () => {
    expect(errorPaths({ quantity: '0' })).toEqual([]);
    for (const quantity of ['', '1.5', '-1', '2147483648']) expect(errorPaths({ quantity })).toContain('quantity');
  });

  it('category and unit required', () => {
    expect(errorPaths({ categoryId: '' })).toContain('categoryId');
    expect(errors({ unit: '' }).find((d) => d.path[0] === 'unit')?.message).toBe('Vui lòng chọn đơn vị');
  });

  it('images: kept + new between 1 and 10', () => {
    expect(errors({ images: [] }).find((d) => d.path[0] === 'images')?.message).toBe('Sản phẩm cần từ 1 đến 10 ảnh');
    expect(errorPaths({ images: [], keptMediaIds: ['m1'] })).toEqual([]);
    const ten = Array.from({ length: 10 }, (_, i) => `m${i}`);
    expect(errorPaths({ keptMediaIds: ten })).toContain('images');
    expect(errorPaths({ keptMediaIds: ten.slice(1) })).toEqual([]);
  });

  it('image extension and size checked', () => {
    expect(errorPaths({ images: [pickedImage('a', { extension: 'gif' })] })).toContain('images.0.extension');
    expect(errorPaths({ images: [pickedImage('a', { size: 11 * 1024 * 1024 })] })).toContain('images.0.size');
  });
});
