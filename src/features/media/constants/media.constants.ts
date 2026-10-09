import type { TMediaType } from '../types/media.types';

/** Extensions the server accepts per type (POST /media/presign-url) — other → 400 MEDIA_INVALID_EXTENSION. Same as web. */
export const MEDIA_ALLOWED_EXTENSIONS = {
  IMAGE: ['jpg', 'jpeg', 'png', 'webp'],
  VIDEO: ['mp4', 'mov'],
  FILE: ['pdf'],
} as const satisfies Record<TMediaType, readonly string[]>;

/** The storage refuses bigger files on PUT. */
export const MEDIA_MAX_FILE_BYTES = 10 * 1024 * 1024;
