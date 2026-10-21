import { getReviewTargetRoute } from './notification-target.util';

describe('getReviewTargetRoute', () => {
  it('shop review (USER) → the recipient distributor profile', () => {
    expect(getReviewTargetRoute({ targetType: 'USER', targetId: 'd1' }, 'd1')).toBe('/profile/d1');
  });

  it('product review → the product page', () => {
    expect(getReviewTargetRoute({ targetType: 'PRODUCT', targetId: 'p1' }, 'd1')).toBe('/product/p1');
  });
});
