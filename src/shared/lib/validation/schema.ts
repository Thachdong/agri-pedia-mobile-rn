import type { ObjectSchema, PartialSchemaMap } from 'joi';
import { v } from './joi';

/** Object schema tied to the feature's input type `T` (field names must match the type). */
export function schema<T extends object>(keys: PartialSchemaMap<T>): ObjectSchema<T> {
  return v.object<T>(keys);
}

export type TSchema<T extends object> = ObjectSchema<T>;
