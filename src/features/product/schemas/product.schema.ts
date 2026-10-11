import { getMediaExtensions, MEDIA_MAX_FILE_BYTES } from '@/features/media';
import { rules, schema, v } from '@/shared/lib/validation';
import {
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_MEDIA_MAX,
  PRODUCT_NAME_MAX,
  PRODUCT_PRICE_MAX,
  PRODUCT_QUANTITY_MAX,
  PRODUCT_STATUSES,
  PRODUCT_UNITS,
} from '../constants/product.constants';
import type { TProductFormValues } from '../types/product.types';
import { parseDecimal } from '../utils/product-form.util';

const PRICE_REQUIRED = 'Vui lòng nhập giá';
const QUANTITY_REQUIRED = 'Vui lòng nhập số lượng';
const IMAGES_RANGE = `Sản phẩm cần từ 1 đến ${PRODUCT_MEDIA_MAX} ảnh`;

/** Typed price: digits, optional `.` / `,` + at most 2 decimals (DTO: >= 0, 2 decimals), not above the DTO max. */
const PRICE_PATTERN = /^\d+([.,]\d{1,2})?$/;
/** Typed quantity: integer >= 0 (DTO), not above the DTO max. */
const QUANTITY_PATTERN = /^\d+$/;

const productImage = rules.pickedFile({ extensions: getMediaExtensions(['IMAGE']), maxBytes: MEDIA_MAX_FILE_BYTES });

/**
 * Create (M8) / edit (M9) — mirrors CreateProductDto / UpdateProductDto, same rules as web. Mobile differences:
 * price / quantity validated as typed text (TextInput), images = kept current ones + new picked files, 1..10 in total
 * (create: 1..10 new; the picker never offers more than the free slots).
 */
export const productFormSchema = schema<TProductFormValues>({
  name: v
    .string()
    .trim()
    .min(1)
    .max(PRODUCT_NAME_MAX)
    .required()
    .messages({ 'string.empty': 'Vui lòng nhập tên sản phẩm' }),
  description: v
    .string()
    .trim()
    .min(1)
    .max(PRODUCT_DESCRIPTION_MAX)
    .required()
    .messages({ 'string.empty': 'Vui lòng nhập mô tả' }),
  price: v
    .string()
    .trim()
    .pattern(PRICE_PATTERN)
    .custom((value: string, helpers) => (parseDecimal(value) <= PRODUCT_PRICE_MAX ? value : helpers.error('price.max')))
    .required()
    .messages({
      'string.empty': PRICE_REQUIRED,
      'string.pattern.base': 'Giá là số không âm, tối đa 2 chữ số thập phân',
      'price.max': 'Giá quá lớn',
    }),
  quantity: v
    .string()
    .trim()
    .pattern(QUANTITY_PATTERN)
    .custom((value: string, helpers) => (Number(value) <= PRODUCT_QUANTITY_MAX ? value : helpers.error('quantity.max')))
    .required()
    .messages({
      'string.empty': QUANTITY_REQUIRED,
      'string.pattern.base': 'Số lượng là số nguyên không âm',
      'quantity.max': 'Số lượng quá lớn',
    }),
  categoryId: v.string().required().messages(rules.selectRequired('Vui lòng chọn danh mục')),
  unit: v
    .string()
    .valid(...PRODUCT_UNITS)
    .required()
    .messages({ ...rules.selectRequired('Vui lòng chọn đơn vị'), 'any.only': 'Vui lòng chọn đơn vị' }),
  status: v
    .string()
    .valid(...PRODUCT_STATUSES)
    .required(),
  keptMediaIds: v.array().items(v.string()).required(),
  images: v
    .array()
    .items(productImage)
    .custom((images: unknown[], helpers) => {
      const kept = (helpers.state.ancestors[0] as Partial<TProductFormValues>).keptMediaIds?.length ?? 0;
      const total = kept + images.length;
      return total >= 1 && total <= PRODUCT_MEDIA_MAX ? images : helpers.error('images.range');
    })
    .required()
    .messages({ 'images.range': IMAGES_RANGE }),
});
