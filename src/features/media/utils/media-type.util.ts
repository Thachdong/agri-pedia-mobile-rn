import { MEDIA_ALLOWED_EXTENSIONS } from '../constants/media.constants';
import type { TMediaType, TUploadedMedia } from '../types/media.types';

/** Extensions accepted by any of `types` (merged, in order). */
export const getMediaExtensions = (types: readonly TMediaType[]): string[] =>
  types.flatMap((type) => MEDIA_ALLOWED_EXTENSIONS[type]);

/** First type of `types` accepting `extension` (license .pdf → FILE, .jpg → IMAGE); none → null. */
export function resolveMediaType<TType extends TMediaType>(extension: string, types: readonly TType[]): TType | null {
  const ext = extension.toLowerCase();
  return types.find((type) => (MEDIA_ALLOWED_EXTENSIONS[type] as readonly string[]).includes(ext)) ?? null;
}

/** Narrows an uploaded file to the types a save DTO accepts (avatar IMAGE, license IMAGE | FILE). */
export const isMediaOfType = <TType extends TMediaType>(
  media: TUploadedMedia,
  types: readonly TType[],
): media is TUploadedMedia<TType> => (types as readonly TMediaType[]).includes(media.type);
