import { AppError } from '@/shared/lib/http';
import { isProductNotFound } from './product-error.util';

describe('isProductNotFound', () => {
  it('PRODUCT_NOT_FOUND or any 404 → true; others false', () => {
    expect(isProductNotFound(new AppError({ status: 404, code: 'PRODUCT_NOT_FOUND', message: 'x' }))).toBe(true);
    expect(isProductNotFound(new AppError({ status: 404, code: 'OTHER', message: 'x' }))).toBe(true);
    expect(isProductNotFound(new AppError({ status: 500, code: 'UNKNOWN', message: 'x' }))).toBe(false);
    expect(isProductNotFound(new Error('boom'))).toBe(false);
  });
});
