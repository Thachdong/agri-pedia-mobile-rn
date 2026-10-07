import type { TApiSchema } from '@/shared/lib/http';

export type TRegisterInput = TApiSchema<'RegisterUserDto'>;
export type TRegisterAddressInput = TApiSchema<'RegisterAddressDto'>;
export type TLoginType = TRegisterInput['loginType'];
export type TUserRole = TRegisterInput['role'];
export type { TBusinessType } from '@/shared/types';
