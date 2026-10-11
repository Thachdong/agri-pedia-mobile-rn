import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Linking, Text } from 'react-native';
import { useSession } from '@/features/auth';
import { AppError } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { renderWithProviders } from '@/test-utils';
import { getDistributorProfile } from '../services/distributor-profile.service';
import { distributorProfile } from '../test/distributor.fixtures';
import { DistributorProfileInfo } from './distributor-profile-info';

jest.mock('../services/distributor-profile.service');
jest.mock('@/shared/lib/toast', () => ({ toast: { error: jest.fn() } }));
jest.mock('@/features/location', () => ({ useAddressLabel: () => '1 Kim Mã, Phường Ba Đình, Hà Nội' }));
jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));
jest.mock('@/features/user', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return { ManageAddressesSection: ({ userId }: { userId: string }) => <MockText>{`ADDRESSES ${userId}`}</MockText> };
});

describe('DistributorProfileInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue({ status: 'guest', user: undefined, isLoggedIn: false });
  });

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

  it('owner → manages the addresses (no read-only "Địa chỉ" row)', async () => {
    jest.mocked(useSession).mockReturnValue({
      status: 'authenticated',
      user: { id: 'd1', role: 'DISTRIBUTOR' },
      isLoggedIn: true,
    } as ReturnType<typeof useSession>);
    jest.mocked(getDistributorProfile).mockResolvedValue(distributorProfile());
    await renderWithProviders(<DistributorProfileInfo distributorId="d1" />);

    expect(await screen.findByText('ADDRESSES d1')).toBeOnTheScreen();
    expect(screen.queryByText('1 Kim Mã, Phường Ba Đình, Hà Nội')).toBeNull();
  });

  it('another viewer → read-only "Địa chỉ" row, no address management', async () => {
    jest.mocked(useSession).mockReturnValue({
      status: 'authenticated',
      user: { id: 'f1', role: 'FARMER' },
      isLoggedIn: true,
    } as ReturnType<typeof useSession>);
    jest.mocked(getDistributorProfile).mockResolvedValue(distributorProfile());
    await renderWithProviders(<DistributorProfileInfo distributorId="d1" />);

    expect(await screen.findByText('1 Kim Mã, Phường Ba Đình, Hà Nội')).toBeOnTheScreen();
    expect(screen.queryByText(/ADDRESSES/)).toBeNull();
  });

  it('session loading → neither the address row nor the management yet', async () => {
    jest.mocked(useSession).mockReturnValue({ status: 'loading', user: undefined, isLoggedIn: false });
    jest.mocked(getDistributorProfile).mockResolvedValue(distributorProfile());
    await renderWithProviders(<DistributorProfileInfo distributorId="d1" />);

    expect(await screen.findByRole('header', { name: 'Đại lý Minh Phát' })).toBeOnTheScreen();
    expect(screen.queryByText('1 Kim Mã, Phường Ba Đình, Hà Nội')).toBeNull();
    expect(screen.queryByText(/ADDRESSES/)).toBeNull();
  });
});
