import type { TNearbyDistributorsParams } from '@/features/distributor';
import type { TDistributorReviewsParams, TReviewTargetType } from '@/features/review';

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
    /** Every address of the caller (GET /users/me/addresses). */
    addresses: () => [...queryKeys.users.all, 'addresses'] as const,
  },
  location: {
    all: ['location'] as const,
    provinces: () => [...queryKeys.location.all, 'provinces'] as const,
    wards: (provinceCode: string) => [...queryKeys.location.all, 'wards', provinceCode] as const,
  },
  distributors: {
    all: ['distributors'] as const,
    /** Prefix of every nearby search — the caller's primary address is the search center. */
    nearbyLists: () => [...queryKeys.distributors.all, 'nearby'] as const,
    nearby: (params: TNearbyDistributorsParams) => [...queryKeys.distributors.nearbyLists(), params] as const,
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
  products: {
    all: ['products'] as const,
    /** ACTIVE products of one shop (infinite, cursor) — tab "Sản Phẩm". */
    list: (distributorId: string) => [...queryKeys.products.all, 'list', distributorId] as const,
    /** One product (GET /products/{id}) — detail page + edit form. */
    detail: (productId: string) => [...queryKeys.products.all, 'detail', productId] as const,
    categories: () => [...queryKeys.products.all, 'categories'] as const,
  },
  diagnoses: {
    all: ['diagnoses'] as const,
    /** GET /diagnoses/settings — `remainingToday` belongs to the caller (session change clears the whole cache). */
    settings: () => [...queryKeys.diagnoses.all, 'settings'] as const,
    /** One of my diagnoses (GET /diagnoses/{id}) — result page. */
    detail: (id: string) => [...queryKeys.diagnoses.all, 'detail', id] as const,
  },
  knowledge: {
    all: ['knowledge'] as const,
    /** Crops enabled for diagnosis (GET /knowledge/crops). */
    crops: () => [...queryKeys.knowledge.all, 'crops'] as const,
    /** Vietnamese detail of one disease (GET /knowledge/diseases/{code}). */
    disease: (code: string) => [...queryKeys.knowledge.all, 'disease', code] as const,
  },
  articles: {
    all: ['articles'] as const,
    /** Top articles of every crop (GET /knowledge/articles/top) — home. */
    top: () => [...queryKeys.articles.all, 'top'] as const,
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
    /** Reviews of one product (infinite, cursor) — product detail. */
    product: (productId: string) => [...queryKeys.reviews.all, 'product', productId] as const,
    /** Rating of a product / a distributor itself (GET /reviews/summary). */
    summary: (targetType: TReviewTargetType, targetId: string) =>
      [...queryKeys.reviews.all, 'summary', targetType, targetId] as const,
  },
} as const;
