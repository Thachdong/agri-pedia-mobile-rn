import type { TReviewTargetType } from '../types/review.types';

export const REVIEW_CONTENT_MAX = 1000;

/** Content hint per target (shop: same as web). */
export const REVIEW_CONTENT_PLACEHOLDER: Record<TReviewTargetType, string> = {
  USER: 'Chất lượng sản phẩm, tư vấn, giao hàng…',
  PRODUCT: 'Chất lượng, đóng gói, đúng mô tả…',
};

/** Reviewer whose account no longer exists (`user.username` null). Same as web. */
export const REVIEW_UNKNOWN_USER_NAME = 'Người dùng';
