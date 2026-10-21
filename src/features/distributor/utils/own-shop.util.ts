import type { TDistributorProfile, TNearbyDistributor } from '../types/distributor.types';

/** Own profile → a list row (no distance); null when the shop has no address yet (not listed by nearby either). */
export const profileToNearbyItem = (profile: TDistributorProfile): TNearbyDistributor | null =>
  profile.address
    ? {
        userId: profile.id,
        username: profile.username,
        avatar: profile.avatar,
        bussinessType: profile.bussinessType,
        address: profile.address,
        distanceMeters: null,
      }
    : null;

/** `own` first, then every other item (own removed where the search also returned it). */
export const pinOwnShop = (items: readonly TNearbyDistributor[], own: TNearbyDistributor | null) =>
  own ? [own, ...items.filter((item) => item.userId !== own.userId)] : [...items];
