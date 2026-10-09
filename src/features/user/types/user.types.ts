import type { TApiSchema } from '@/shared/lib/http';

/** PATCH /users/me — absent / null fields are kept; avatar / license = files already uploaded to TMP. */
export type TUpdateProfileInput = TApiSchema<'UpdateProfileDto'>;
export type TUpdateProfileResponse = TApiSchema<'UpdateProfileResponse'>;
