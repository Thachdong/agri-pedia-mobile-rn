import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

/** Used in `features/<x>/hooks/<entity>.queries.ts` — shared by hooks and by cache reads/writes. */
export const appQueryOptions = queryOptions;
export const appInfiniteQueryOptions = infiniteQueryOptions;
