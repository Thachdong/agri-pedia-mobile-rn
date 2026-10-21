import { renderHook } from '@testing-library/react-native';
import { useAddressLabel } from './use-address-label';
import { useProvinces } from './use-provinces';
import { useWards } from './use-wards';

jest.mock('./use-provinces');
jest.mock('./use-wards');

const address = { province: 'ha_noi', ward: 'ba_dinh', houseNumber: ' 1 Kim Mã ' };

describe('useAddressLabel', () => {
  it('names from provinces / wards: "số nhà, xã, tỉnh"', async () => {
    jest.mocked(useProvinces).mockReturnValue({ data: [{ codename: 'ha_noi', name: 'Hà Nội' }] } as never);
    jest.mocked(useWards).mockReturnValue({ data: [{ codename: 'ba_dinh', name: 'Phường Ba Đình' }] } as never);
    const { result } = await renderHook(() => useAddressLabel(address));
    expect(result.current).toBe('1 Kim Mã, Phường Ba Đình, Hà Nội');
    expect(useWards).toHaveBeenCalledWith('ha_noi');
  });

  it('names not loaded → codenames; no address → null', async () => {
    jest.mocked(useProvinces).mockReturnValue({ data: undefined } as never);
    jest.mocked(useWards).mockReturnValue({ data: undefined } as never);
    expect((await renderHook(() => useAddressLabel(address))).result.current).toBe('1 Kim Mã, ba_dinh, ha_noi');
    expect((await renderHook(() => useAddressLabel(null))).result.current).toBeNull();
  });
});
