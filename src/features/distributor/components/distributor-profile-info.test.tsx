import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Linking, Text } from 'react-native';
import { AppError } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { renderWithProviders } from '@/test-utils';
import { getDistributorProfile } from '../services/distributor-profile.service';
import { distributorProfile } from '../test/distributor.fixtures';
import { DistributorProfileInfo } from './distributor-profile-info';

jest.mock('../services/distributor-profile.service');
jest.mock('@/shared/lib/toast', () => ({ toast: { error: jest.fn() } }));
jest.mock('@/features/location', () => ({ useAddressLabel: () => '1 Kim Mã, Phường Ba Đình, Hà Nội' }));

describe('DistributorProfileInfo', () => {
  beforeEach(() => jest.clearAllMocks());

  it('username, actions slot and the 5 rows with values', async () => {
    jest.mocked(getDistributorProfile).mockResolvedValue(distributorProfile());
    await renderWithProviders(<DistributorProfileInfo distributorId="d1" actions={<Text>ACTIONS</Text>} />);

    expect(await screen.findByRole('header', { name: 'Đại lý Minh Phát' })).toBeOnTheScreen();
    expect(screen.getByText('ACTIONS')).toBeOnTheScreen();
    expect(screen.getByText('minhphat@example.com')).toBeOnTheScreen();
    expect(screen.getByText('1 Kim Mã, Phường Ba Đình, Hà Nội')).toBeOnTheScreen();
    expect(screen.getByText('Giống cây trồng')).toBeOnTheScreen();
    expect(screen.getByText('Chuyên giống lúa')).toBeOnTheScreen();
  });

  it('license → "Xem giấy phép" opens the signed URL; none → "Chưa cung cấp"', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    jest.mocked(getDistributorProfile).mockResolvedValue(distributorProfile());
    await renderWithProviders(<DistributorProfileInfo distributorId="d1" />);
    await fireEvent.press(await screen.findByRole('link', { name: 'Xem giấy phép' }));
    expect(openURL).toHaveBeenCalledWith('https://storage.example.com/license.pdf?sig=1');

    jest.mocked(getDistributorProfile).mockResolvedValue(distributorProfile({ id: 'd2', bussinessLicense: null }));
    await renderWithProviders(<DistributorProfileInfo distributorId="d2" />);
    expect(await screen.findByText('Chưa cung cấp')).toBeOnTheScreen();
  });

  it('404 → not found, no retry', async () => {
    jest
      .mocked(getDistributorProfile)
      .mockRejectedValue(new AppError({ status: 404, code: 'USER_DISTRIBUTOR_NOT_FOUND', message: 'x' }));
    await renderWithProviders(<DistributorProfileInfo distributorId="x" />);
    expect(await screen.findByText('Không tìm thấy nhà phân phối')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Thử lại' })).toBeNull();
  });

  it('license that cannot be opened → toast', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no handler'));
    jest.mocked(getDistributorProfile).mockResolvedValue(distributorProfile());
    await renderWithProviders(<DistributorProfileInfo distributorId="d1" />);
    await fireEvent.press(await screen.findByRole('link', { name: 'Xem giấy phép' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Không mở được giấy phép. Vui lòng thử lại.'));
  });
});
