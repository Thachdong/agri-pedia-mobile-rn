import { getMediaExtensions, MEDIA_MAX_FILE_BYTES } from '@/features/media';
import { BUSINESS_TYPE_OPTIONS } from '@/shared/constants';
import { rules, schema, v } from '@/shared/lib/validation';
import { AVATAR_MEDIA_TYPES, BIO_MAX, LICENSE_MEDIA_TYPES } from '../constants/user.constants';
import type { TEditProfileFormValues } from '../types/user.types';

const BUSINESS_TYPES = BUSINESS_TYPE_OPTIONS.map((option) => option.value);
const MAX_MB = MEDIA_MAX_FILE_BYTES / (1024 * 1024);

/** A picked file (or null = keep the current one): allowed extension + at most 10 MB (size unknown → server decides). */
const pickedFile = (extensions: string[]) =>
  v
    .object({
      extension: v
        .string()
        .valid(...extensions)
        .required()
        .messages({ 'any.only': `Chỉ nhận tệp ${extensions.join(', ')}` }),
      size: v
        .number()
        .max(MEDIA_MAX_FILE_BYTES)
        .allow(null)
        .messages({ 'number.max': `Tệp tối đa ${MAX_MB} MB` }),
    })
    .unknown(true)
    .allow(null);

/** Mirrors UpdateProfileDto for a DISTRIBUTOR (business type required). Same rules as web. */
export const editProfileSchema = schema<TEditProfileFormValues>({
  username: rules.username().required(),
  bussinessType: v
    .string()
    .valid(...BUSINESS_TYPES)
    .empty(null)
    .required()
    .messages(rules.selectRequired('Vui lòng chọn loại hình kinh doanh')),
  bio: v.string().trim().max(BIO_MAX).allow(''),
  avatar: pickedFile(getMediaExtensions(AVATAR_MEDIA_TYPES)),
  bussinessLicense: pickedFile(getMediaExtensions(LICENSE_MEDIA_TYPES)),
});
