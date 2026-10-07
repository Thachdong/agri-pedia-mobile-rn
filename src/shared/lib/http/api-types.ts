import type { components, paths } from './openapi';

/** Type of one schema in specs/openapi.json — e.g. `TApiSchema<'LoginUserResponse'>`. Regenerate with `npm run gen:api`. */
export type TApiSchema<K extends keyof components['schemas']> = components['schemas'][K];

export type TApiPaths = paths;
