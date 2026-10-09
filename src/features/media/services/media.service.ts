import { http, uploadToSignedUrl } from '@/shared/lib/http';
import type { TPresignedMedia, TPresignFileInput, TPresignUrlsResponse } from '../types/media.types';

/** 1..10 files, all-or-nothing — one bad extension → 400 MEDIA_INVALID_EXTENSION and no URL at all. */
export const presignUrls = (files: TPresignFileInput[], signal?: AbortSignal) =>
  http.post<TPresignUrlsResponse>('/media/presign-url', { files }, { signal });

/** PUT one local file to its presigned URL with exactly the headers the server gave. */
export const putMediaFile = (presigned: TPresignedMedia, fileUri: string, signal?: AbortSignal) =>
  uploadToSignedUrl(presigned.presignUrl, fileUri, { headers: presigned.headers, signal });
