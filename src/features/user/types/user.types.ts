import type { TPickedFile } from '@/shared/lib/device';
import type { TApiSchema } from '@/shared/lib/http';

/** PATCH /users/me — absent / null fields are kept; avatar / license = files already uploaded to TMP. */
export type TUpdateProfileInput = TApiSchema<'UpdateProfileDto'>;
export type TUpdateProfileResponse = TApiSchema<'UpdateProfileResponse'>;

/**
 * Edit profile form (M6). Files: `null` = keep the current one (clearing isn't supported by the API);
 * a picked file is uploaded on save. `bussinessType` null only before the user picks (DISTRIBUTOR must have one).
 */
export type TEditProfileFormValues = {
  username: string;
  bussinessType: NonNullable<TUpdateProfileInput['bussinessType']> | null;
  bio: string;
  avatar: TPickedFile | null;
  bussinessLicense: TPickedFile | null;
};
