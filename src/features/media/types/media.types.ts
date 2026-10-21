import type { TApiSchema } from '@/shared/lib/http';
import type { TPickedFile } from '@/shared/lib/device';

export type TPresignFileInput = TApiSchema<'PresignFileDto'>;
export type TMediaType = TPresignFileInput['type'];

/** The spec doesn't type `headers` — in practice Content-Type + `x-goog-content-length-range`. */
export type TPresignedMedia = Omit<TApiSchema<'PresignedMediaResponse'>, 'headers'> & { headers: Record<string, string> };
export type TPresignUrlsResponse = Omit<TApiSchema<'GetPresignUrlResponse'>, 'items'> & { items: TPresignedMedia[] };

/** A picked file and the media type it is sent as. */
export type TMediaFile<TType extends TMediaType = TMediaType> = { file: TPickedFile; type: TType };

/** A file uploaded to TMP — the shape of `AvatarFileDto` / `BusinessLicenseFileDto` sent with PATCH /users/me, POST /products... */
export type TUploadedMedia<TType extends TMediaType = TMediaType> = Omit<TPresignFileInput, 'type'> & {
  type: TType;
  key: string;
};
