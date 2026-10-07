import * as Location from 'expo-location';
import { getCurrentPosition } from './location';

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  hasServicesEnabledAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const mocked = jest.mocked(Location);

describe('getCurrentPosition', () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    mocked.hasServicesEnabledAsync.mockResolvedValue(true);
    mocked.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
    mocked.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 21.03, longitude: 105.85 } } as never);
  });

  it('returns { lat, long } when granted', async () => {
    await expect(getCurrentPosition()).resolves.toEqual({ lat: 21.03, long: 105.85 });
  });

  it('returns null when location services are off (no permission prompt)', async () => {
    mocked.hasServicesEnabledAsync.mockResolvedValue(false);
    await expect(getCurrentPosition()).resolves.toBeNull();
    expect(mocked.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('returns null when permission is denied', async () => {
    mocked.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);
    await expect(getCurrentPosition()).resolves.toBeNull();
    expect(mocked.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('returns null when the native call throws', async () => {
    mocked.getCurrentPositionAsync.mockRejectedValue(new Error('E_LOCATION_UNAVAILABLE'));
    await expect(getCurrentPosition()).resolves.toBeNull();
  });

  it('returns null after 15s without a fix', async () => {
    jest.useFakeTimers();
    mocked.getCurrentPositionAsync.mockReturnValue(new Promise(() => undefined));
    const result = getCurrentPosition();
    await jest.advanceTimersByTimeAsync(15_000);
    await expect(result).resolves.toBeNull();
  });
});
