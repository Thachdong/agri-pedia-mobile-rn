import type { TNearbyDistributorsParams } from '@/features/distributor';
import type { TDistributorReviewsParams } from '@/features/review';

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
  distributors: {
    all: ['distributors'] as const,
    nearby: (params: TNearbyDistributorsParams) => [...queryKeys.distributors.all, 'nearby', params] as const,
    /** Public profile of one distributor (GET /distributors/{id}). */
    detail: (distributorId: string) => [...queryKeys.distributors.all, 'detail', distributorId] as const,
  },
  chat: {
    all: ['chat'] as const,
    rooms: () => [...queryKeys.chat.all, 'rooms'] as const,
    messages: (roomId: string) => [...queryKeys.chat.all, 'messages', roomId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: () => [...queryKeys.notifications.all, 'list'] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    /** Prefix of every review query of one shop — a new review of the shop makes all of them stale. */
    distributor: (distributorId: string) => [...queryKeys.reviews.all, 'distributor', distributorId] as const,
    /** Shop + product reviews of a shop by filter (infinite, cursor) — tab "Đánh giá". */
    list: ({ distributorId, ...filters }: TDistributorReviewsParams) =>
      [...queryKeys.reviews.distributor(distributorId), 'list', filters] as const,
    /** One review of the shop looked up by id (REVIEW notification → its target). */
    find: (distributorId: string, reviewId: string) =>
      [...queryKeys.reviews.distributor(distributorId), 'find', reviewId] as const,
  },
} as const;
