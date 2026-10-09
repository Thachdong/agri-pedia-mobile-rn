// Public API of the `media` feature. Other features and src/app import only this file.
export { MEDIA_ALLOWED_EXTENSIONS, MEDIA_MAX_FILE_BYTES } from './constants/media.constants';
export { useUploadMedia } from './hooks/use-upload-media';
export type { TMediaFile, TMediaType, TUploadedMedia } from './types/media.types';
export { getMediaExtensions, resolveMediaType } from './utils/media-type.util';
