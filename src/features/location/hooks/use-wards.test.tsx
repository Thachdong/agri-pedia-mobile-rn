import { renderHook, waitFor } from '@testing-library/react-native';
import { hookWrapper } from '@/test-utils';
import { getProvinces, getWards } from '../services/location.service';
import { useProvinces } from './use-provinces';
import { useWards } from './use-wards';

jest.mock('../services/location.service');

describe('location queries', () => {
  beforeEach(() => jest.resetAllMocks());

  it('useProvinces returns the provinces list', async () => {
    jest.mocked(getProvinces).mockResolvedValue({ provinces: [{ codename: 'ha_noi', name: 'Hà Nội' }] });
    const { result } = await renderHook(() => useProvinces(), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.data).toEqual([{ codename: 'ha_noi', name: 'Hà Nội' }]));
  });

  it('useWards does not call the API without a province', async () => {
    const { result } = await renderHook(() => useWards(undefined), { wrapper: hookWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(getWards).not.toHaveBeenCalled();
  });

  it('useWards returns the wards of the province', async () => {
    jest.mocked(getWards).mockResolvedValue({ wards: [{ codename: 'ba_dinh', name: 'Ba Đình' }] });
    const { result } = await renderHook(() => useWards('ha_noi'), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.data).toEqual([{ codename: 'ba_dinh', name: 'Ba Đình' }]));
    expect(getWards).toHaveBeenCalledWith('ha_noi', expect.anything());
  });
});
