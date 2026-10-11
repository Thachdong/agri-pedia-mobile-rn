import { pickedImage, productDetail } from '../test/product.fixtures';
import type { TProductFormValues } from '../types/product.types';
import { parseDecimal, toCreateProductInput, toProductFormValues, toUpdateProductInput } from './product-form.util';

const uploaded = (key: string) => ({ type: 'IMAGE' as const, key, extension: 'jpg', filename: `${key}.jpg` });

describe('product-form util', () => {
  it('parseDecimal accepts , and .', () => {
    expect(parseDecimal(' 12,5 ')).toBe(12.5);
    expect(parseDecimal('3.25')).toBe(3.25);
  });

  it('prefill from detail keeps every current image', () => {
    expect(toProductFormValues(productDetail())).toMatchObject({
      price: '150000',
      quantity: '120',
      keptMediaIds: ['m1', 'm2'],
      images: [],
    });
  });

  it('create body: trimmed, numbers, media in order with sortOrder', () => {
    const values: TProductFormValues = {
      ...toProductFormValues(productDetail()),
      name: '  Lúa  ',
      price: '12,5',
      quantity: ' 7 ',
      keptMediaIds: [],
      images: [pickedImage('a'), pickedImage('b')],
    };
    const input = toCreateProductInput(values, [uploaded('k1'), uploaded('k2')]);
    expect(input).toMatchObject({ name: 'Lúa', price: 12.5, quantity: 7, unit: 'kg', categoryId: 'c1' });
    expect(input.media.map((m) => [m.key, m.sortOrder])).toEqual([
      ['k1', 0],
      ['k2', 1],
    ]);
    expect(input).not.toHaveProperty('status');
  });

  it('update body: removed images → removeMediaIds, new ones after the kept', () => {
    const product = productDetail();
    const values = { ...toProductFormValues(product), keptMediaIds: ['m2'], status: 'OUT_OF_STOCK' as const };
    const input = toUpdateProductInput(values, product, [uploaded('k1')]);
    expect(input).toMatchObject({ status: 'OUT_OF_STOCK', removeMediaIds: ['m1'] });
    expect(input.addMedia).toEqual([{ ...uploaded('k1'), sortOrder: 1 }]);
  });

  it('update body: nothing added / removed → no media keys', () => {
    const product = productDetail();
    const input = toUpdateProductInput(toProductFormValues(product), product, []);
    expect(input).not.toHaveProperty('addMedia');
    expect(input).not.toHaveProperty('removeMediaIds');
  });
});
