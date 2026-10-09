import { useAppMutation } from '@/shared/lib/query';
import { presignUrls, putMediaFile } from '../services/media.service';
import type { TMediaFile, TMediaType, TUploadedMedia } from '../types/media.types';

/** One presign for all files, then PUT in parallel → what save requests send (`{ type, key, extension, filename }`), same order. */
export async function uploadMedia<TType extends TMediaType>(files: TMediaFile<TType>[]): Promise<TUploadedMedia<TType>[]> {
  if (files.length === 0) return [];
  const metas = files.map(({ file, type }) => ({ filename: file.name, extension: file.extension, type }));
  const { items } = await presignUrls(metas);
  return Promise.all(
    files.map(async ({ file }, index) => {
      const presigned = items[index];
      if (!presigned) throw new Error('Presign response is missing a file');
      await putMediaFile(presigned, file.uri);
      return { ...metas[index]!, key: presigned.key } as TUploadedMedia<TType>;
    }),
  );
}

/**
 * Upload picked files to TMP storage (the save request confirms them). Only TMP → no query becomes stale.
 * Errors (MEDIA_INVALID_EXTENSION, UPLOAD_FAILED, network) toast globally unless the caller passes `meta.silent`.
 */
export const useUploadMedia = () =>
  useAppMutation({
    mutationFn: (files: TMediaFile[]) => uploadMedia(files),
    invalidates: false,
    meta: { silent: true },
  });
