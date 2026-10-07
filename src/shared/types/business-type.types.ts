import type { TApiSchema } from '@/shared/lib/http';

/** DISTRIBUTOR business type — used by register (auth) and the distributor list. Spec spelling: `bussinessType`. */
export type TBusinessType = NonNullable<TApiSchema<'NearbyDistributorResponse'>['bussinessType']>;
