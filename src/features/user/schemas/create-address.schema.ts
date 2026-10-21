import { rules, schema } from '@/shared/lib/validation';
import type { TCreateAddressFormValues } from '../types/user.types';

/** Mirrors CreateAddressDto (POST /users/me/addresses) — no `isPrimary` on the form (a new address is a normal one). */
export const createAddressSchema = schema<TCreateAddressFormValues>(rules.addressFields());
