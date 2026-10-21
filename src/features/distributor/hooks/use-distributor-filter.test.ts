import { act, renderHook } from '@testing-library/react-native';
import { getCurrentPosition } from '@/shared/lib/device';
import { toast } from '@/shared/lib/toast';
import { LOCATE_WAIT_MS, NEAR_ME_FAILED_MESSAGE, USER_LABELS } from '../constants/distributor.constants';
import { useDistributorFilter, type TUseDistributorFilterOptions } from './use-distributor-filter';

jest.mock('@/shared/lib/device', () => ({ getCurrentPosition: jest.fn() }));
jest.mock('@/shared/lib/toast', () => ({ toast: { error: jest.fn() } }));

const HERE = { lat: 10.77, long: 106.7 };
const HOME = { lat: 21.03, long: 105.82 };

/** Resolves pending promises (getCurrentPosition) inside act. */
const flush = () => act(async () => {});

const renderFilter = (options: TUseDistributorFilterOptions) =>
  renderHook((props: TUseDistributorFilterOptions) => useDistributorFilter(props), { initialProps: options });

describe('useDistributorFilter', () => {
  beforeEach(() => jest.resetAllMocks());
  afterEach(() => jest.useRealTimers());

  it('session loading → waits, asks nothing', async () => {
    const { result } = await renderFilter({ viewer: 'pending' });
    expect(result.current.isInitializing).toBe(true);
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it('guest allows location → lat/long + "Bạn ở đây" marker', async () => {
    jest.mocked(getCurrentPosition).mockResolvedValue(HERE);
    const { result } = await renderFilter({ viewer: 'guest' });
    await flush();
    expect(result.current.isInitializing).toBe(false);
    expect(result.current.params).toEqual({ lat: HERE.lat, long: HERE.long });
    expect(result.current.viewerMarker).toEqual({ point: HERE, label: USER_LABELS.device });
  });

  it('guest denies → no location sent (nationwide), no error toast', async () => {
    jest.mocked(getCurrentPosition).mockResolvedValue(null);
    const { result } = await renderFilter({ viewer: 'guest' });
    await flush();
    expect(result.current.isInitializing).toBe(false);
    expect(result.current.params).toEqual({});
    expect(result.current.viewerMarker).toBeNull();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('guest ignores the permission dialog → stops waiting after LOCATE_WAIT_MS', async () => {
    jest.useFakeTimers();
    jest.mocked(getCurrentPosition).mockReturnValue(new Promise(() => {}));
    const { result } = await renderFilter({ viewer: 'guest' });
    expect(result.current.isInitializing).toBe(true);
    await act(() => jest.advanceTimersByTime(LOCATE_WAIT_MS));
    expect(result.current.isInitializing).toBe(false);
    expect(result.current.params).toEqual({});
  });

  it('logged in → no location sent (server uses the primary address), address marker', async () => {
    const { result } = await renderFilter({ viewer: 'user', userAddress: HOME });
    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(result.current.isInitializing).toBe(false);
    expect(result.current.params).toEqual({});
    expect(result.current.viewerMarker).toEqual({ point: HOME, label: USER_LABELS.profile });
  });

  it('province → provinceCode only; clear → back to auto', async () => {
    const { result } = await renderFilter({ viewer: 'user', userAddress: null });
    await act(() => result.current.setProvince('ha_noi'));
    expect(result.current.params).toEqual({ provinceCode: 'ha_noi' });
    await act(() => result.current.clear());
    expect(result.current.filter).toEqual({ kind: 'auto' });
    expect(result.current.params).toEqual({});
  });

  it('"Gần tôi" → point replaces the province (never both)', async () => {
    const { result } = await renderFilter({ viewer: 'user', userAddress: HOME });
    await act(() => result.current.setProvince('ha_noi'));
    jest.mocked(getCurrentPosition).mockResolvedValue(HERE);
    await act(() => result.current.nearMe());
    expect(result.current.params).toEqual({ lat: HERE.lat, long: HERE.long });
    expect(result.current.viewerMarker).toEqual({ point: HERE, label: USER_LABELS.device });
    expect(result.current.isLocatingNear).toBe(false);
  });

  it('"Gần tôi" fails → toast, filter kept', async () => {
    const { result } = await renderFilter({ viewer: 'user', userAddress: null });
    await act(() => result.current.setProvince('ha_noi'));
    jest.mocked(getCurrentPosition).mockResolvedValue(null);
    await act(() => result.current.nearMe());
    expect(toast.error).toHaveBeenCalledWith(NEAR_ME_FAILED_MESSAGE);
    expect(result.current.params).toEqual({ provinceCode: 'ha_noi' });
  });
});
