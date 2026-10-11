import type { TMediaType } from '@/features/media';

/** Media types each profile file is sent as (PATCH /users/me): avatar image only, license image or pdf. */
export const AVATAR_MEDIA_TYPES = ['IMAGE'] as const satisfies readonly TMediaType[];
export const LICENSE_MEDIA_TYPES = ['IMAGE', 'FILE'] as const satisfies readonly TMediaType[];

export const BIO_MAX = 1000;
