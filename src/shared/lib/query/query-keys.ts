/**
 * CENTRAL registry of query keys — the only place keys are written (same names as the web client).
 * One namespace per feature, factory pattern, `as const`:
 *
 *   reviews: {
 *     all: ['reviews'] as const,
 *     list: (filter: TReviewFilter) => [...queryKeys.reviews.all, 'list', filter] as const,
 *   },
 *
 * Filter types come from the feature with `import type` through its index (type-only, allowed).
 * Namespaces are added by rn-feature-api when an endpoint is connected.
 */
export const queryKeys = {
  /** Prefix of EVERY query — only for session changes (login / logout) that make the whole cache stale. */
  all: [] as const,
  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
  },
  location: {
    all: ['location'] as const,
    provinces: () => [...queryKeys.location.all, 'provinces'] as const,
    wards: (provinceCode: string) => [...queryKeys.location.all, 'wards', provinceCode] as const,
  },
} as const;
