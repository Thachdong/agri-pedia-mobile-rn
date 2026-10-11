import type { TUserRole } from '@/features/auth';
import { getMediaExtensions, MEDIA_MAX_FILE_BYTES } from '@/features/media';
import { BUSINESS_TYPE_OPTIONS } from '@/shared/constants';
import { rules, schema, v } from '@/shared/lib/validation';
import { AVATAR_MEDIA_TYPES, BIO_MAX, LICENSE_MEDIA_TYPES } from '../constants/user.constants';
import type { TEditProfileFormValues } from '../types/user.types';

const BUSINESS_TYPES = BUSINESS_TYPE_OPTIONS.map((option) => option.value);
/** A picked file (or null = keep the current one): allowed extension + at most 10 MB (size unknown → server decides). */
const pickedFile = (extensions: string[]) =>
  rules.pickedFile({ extensions, maxBytes: MEDIA_MAX_FILE_BYTES }).allow(null);

const commonFields = {
  username: rules.username().required(),
  bio: v.string().trim().max(BIO_MAX).allow(''),
  avatar: pickedFile(getMediaExtensions(AVATAR_MEDIA_TYPES)),
};

/** Mirrors UpdateProfileDto for a DISTRIBUTOR (business type required). Same rules as web. */
export const editProfileSchema = schema<TEditProfileFormValues>({
  ...commonFields,
  bussinessType: v
    .string()
    .valid(...BUSINESS_TYPES)
    .empty(null)
    .required()
    .messages(rules.selectRequired('Vui lòng chọn loại hình kinh doanh')),
  bussinessLicense: pickedFile(getMediaExtensions(LICENSE_MEDIA_TYPES)),
});

/**
 * Mirrors UpdateProfileDto for a FARMER: username, bio, avatar only — business type / license belong to a DISTRIBUTOR
 * (USER_BUSINESS_TYPE_NOT_ALLOWED), so the form keeps them null.
 */
export const farmerEditProfileSchema = schema<TEditProfileFormValues>({
  ...commonFields,
  bussinessType: v.valid(null),
  bussinessLicense: v.valid(null),
});

/** Edit profile schema (M6) of the logged-in user's role. */
export const getEditProfileSchema = (role: TUserRole) =>
  role === 'FARMER' ? farmerEditProfileSchema : editProfileSchema;
