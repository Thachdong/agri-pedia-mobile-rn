import type { TAddressFieldsValue } from '@/features/location';
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

/** GET /users/me/addresses — primary first; `province` / `ward` are codenames. */
export type TMyAddressesResponse = TApiSchema<'ListMyAddressesResponse'>;
export type TMyAddress = TApiSchema<'MyAddressResponse'>;
/** POST /users/me/addresses — `isPrimary` defaults to false. */
export type TCreateAddressInput = TApiSchema<'CreateAddressDto'>;
export type TCreateAddressResponse = TApiSchema<'CreateAddressResponse'>;

/** Add address form (M7) — lat / long missing until a position is picked on the map. */
export type TCreateAddressFormValues = TAddressFieldsValue;
