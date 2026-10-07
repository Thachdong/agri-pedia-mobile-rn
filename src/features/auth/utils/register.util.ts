import type { TRegisterFormValues, TRegisterInput } from '../types/auth.types';

/** Only the RegisterUserDto fields — drops `confirmPassword` (client only). Values are already trimmed by the schema. */
export const toRegisterInput = ({
  loginType,
  identifier,
  password,
  username,
  role,
  bussinessType,
  bio,
  address,
}: TRegisterFormValues): TRegisterInput => ({
  loginType,
  identifier,
  password,
  username,
  role,
  bussinessType,
  bio,
  address,
});
