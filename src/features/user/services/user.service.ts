import { http } from '@/shared/lib/http';
import type { TUpdateProfileInput, TUpdateProfileResponse } from '../types/user.types';

/** 400 USER_BUSINESS_TYPE_NOT_ALLOWED / USER_BUSINESS_TYPE_REQUIRED, 404 USER_NOT_FOUND. */
export const updateMe = (input: TUpdateProfileInput) => http.patch<TUpdateProfileResponse>('/users/me', input);
