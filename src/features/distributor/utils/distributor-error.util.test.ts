import { AppError } from '@/shared/lib/http';
import { isDistributorNotFound } from './distributor-error.util';

describe('isDistributorNotFound', () => {
  it('USER_DISTRIBUTOR_NOT_FOUND or 404 → true; other errors → false', () => {
    expect(isDistributorNotFound(new AppError({ status: 404, code: 'USER_DISTRIBUTOR_NOT_FOUND', message: '' }))).toBe(true);
    expect(isDistributorNotFound(new AppError({ status: 404, code: 'X', message: '' }))).toBe(true);
    expect(isDistributorNotFound(new AppError({ status: 0, code: 'NETWORK_ERROR', message: '' }))).toBe(false);
    expect(isDistributorNotFound(new Error('x'))).toBe(false);
  });
});
