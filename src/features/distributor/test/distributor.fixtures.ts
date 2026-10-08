import type {
  TNearbyDistributor,
  TNearbyDistributorsResponse,
  TNearbyDistributorsView,
} from '../types/distributor.types';

/** One item of GET /distributors/nearby. */
export const nearbyDistributor = (overrides: Partial<TNearbyDistributor> = {}): TNearbyDistributor => ({
  userId: 'd1',
  username: 'Đại lý Minh Phát',
  avatar: null,
  bussinessType: 'SEEDS_SEEDLINGS',
  address: { province: 'ha_noi', ward: 'ba_dinh', houseNumber: '1 Kim Mã', lat: 21.03, long: 105.82 },
  distanceMeters: 1234,
  ...overrides,
});

export const nearbyResponse = (overrides: Partial<TNearbyDistributorsResponse> = {}): TNearbyDistributorsResponse => ({
  scope: 'radius',
  source: 'query_point',
  items: [nearbyDistributor()],
  total: 1,
  ...overrides,
});

export const nearbyView = (overrides: Partial<TNearbyDistributorsView> = {}): TNearbyDistributorsView => ({
  scope: 'radius',
  source: 'query_point',
  total: 1,
  items: [nearbyDistributor()],
  ...overrides,
});
