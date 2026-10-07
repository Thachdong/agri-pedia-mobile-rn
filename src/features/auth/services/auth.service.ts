import { http } from '@/shared/lib/http';
import type { TRegisterInput } from '../types/auth.types';

/** 201, empty body. FARMER is ACTIVE at once; DISTRIBUTOR is PENDING and receives an activation code. */
export const register = (input: TRegisterInput) => http.post<void, TRegisterInput>('/auth/register', input);
