import { distributorProfile, nearbyDistributor } from '../test/distributor.fixtures';
import { pinOwnShop, profileToNearbyItem } from './own-shop.util';

describe('own shop', () => {
  it('profile → list row without distance; no address → null', () => {
    const profile = distributorProfile({ id: 'me', username: 'Shop của tôi' });
    expect(profileToNearbyItem(profile)).toEqual({
      userId: 'me',
      username: 'Shop của tôi',
      avatar: profile.avatar,
      bussinessType: profile.bussinessType,
      address: profile.address,
      distanceMeters: null,
    });
    expect(profileToNearbyItem(distributorProfile({ address: null }))).toBeNull();
  });

  it('pinOwnShop: own first, no duplicate; null → same items', () => {
    const items = [nearbyDistributor({ userId: 'a' }), nearbyDistributor({ userId: 'me' })];
    const own = nearbyDistributor({ userId: 'me' });
    expect(pinOwnShop(items, own).map((item) => item.userId)).toEqual(['me', 'a']);
    expect(pinOwnShop(items, null).map((item) => item.userId)).toEqual(['a', 'me']);
  });
});
