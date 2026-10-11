import { schema, v } from '@/shared/lib/validation';
import { REVIEW_CONTENT_MAX } from '../constants/review.constants';
import type { TReviewFormValues } from '../types/review.types';

/** Mirrors CreateReviewDto: star integer 1..5, content 1..1000 chars after trim. Same as web. */
export const reviewSchema = schema<TReviewFormValues>({
  star: v
    .number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({ 'number.min': 'Vui lòng chọn số sao', 'any.required': 'Vui lòng chọn số sao' }),
  content: v
    .string()
    .trim()
    .min(1)
    .max(REVIEW_CONTENT_MAX)
    .required()
    .messages({ 'string.empty': 'Vui lòng nhập nội dung đánh giá' }),
});
