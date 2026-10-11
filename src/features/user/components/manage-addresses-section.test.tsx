import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AppError } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { renderWithProviders } from '@/test-utils';
import { deleteMyAddress, getMyAddresses, setMyPrimaryAddress } from '../services/user.service';
import { myAddress } from '../test/user.fixtures';
import { ManageAddressesSection } from './manage-addresses-section';

jest.mock('../services/user.service');
// No names loaded → labels fall back to the codenames.
jest.mock('@/features/location/services/location.service', () => ({
  getProvinces: jest.fn(async () => ({ provinces: [] })),
  getWards: jest.fn(async () => ({ wards: [] })),
}));
jest.mock('@/shared/lib/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock('./add-address-sheet', () => ({ AddAddressSheet: () => null }));

const primary = myAddress({
  id: 'a1',
  houseNumber: '1 Kim Mã',
  isPrimary: true,
});
const other = myAddress({
  id: 'a2',
  houseNumber: '2 Láng Hạ',
  isPrimary: false,
});
const label = (houseNumber: string) => `${houseNumber}, ba_dinh, ha_noi`;

const renderSection = () => renderWithProviders(<ManageAddressesSection userId="u1" />);

describe('ManageAddressesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getMyAddresses).mockResolvedValue({ addresses: [primary, other] });
  });

  it('lists the addresses, primary checked; its delete button disabled', async () => {
    await renderSection();
    expect(
      await screen.findByRole('radio', {
        name: `${label('1 Kim Mã')}. Mặc định`,
      }),
    ).toBeChecked();
    expect(screen.getByRole('radio', { name: label('2 Láng Hạ') })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Không thể xoá địa chỉ mặc định' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Xoá địa chỉ' })).toBeEnabled();
  });

  it('choosing another address only asks — the radio keeps the current primary until confirmed', async () => {
    await renderSection();
    await fireEvent.press(await screen.findByRole('radio', { name: label('2 Láng Hạ') }));
    expect(setMyPrimaryAddress).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: `${label('1 Kim Mã')}. Mặc định` })).toBeChecked();
    // The confirm sheet names the chosen address (row + sheet description).
    expect(screen.getAllByText(label('2 Láng Hạ'))).toHaveLength(2);
  });

  it('confirm → PATCH primary, toast', async () => {
    jest.mocked(setMyPrimaryAddress).mockResolvedValue(undefined);
    await renderSection();
    await fireEvent.press(await screen.findByRole('radio', { name: label('2 Láng Hạ') }));
    await fireEvent.press(screen.getByRole('button', { name: 'Đặt mặc định' }));

    await waitFor(() => expect(setMyPrimaryAddress).toHaveBeenCalledWith('a2'));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Đã đổi địa chỉ mặc định'));
  });

  it('delete → confirm → DELETE, toast', async () => {
    jest.mocked(deleteMyAddress).mockResolvedValue(undefined);
    await renderSection();
    await fireEvent.press(await screen.findByRole('button', { name: 'Xoá địa chỉ' }));
    expect(screen.getByText(`Địa chỉ "${label('2 Láng Hạ')}" sẽ bị xoá khỏi tài khoản.`)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Xoá' }));

    await waitFor(() => expect(deleteMyAddress).toHaveBeenCalledWith('a2'));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Đã xoá địa chỉ'));
  });

  it('delete 409 → message in the confirm sheet', async () => {
    jest.mocked(deleteMyAddress).mockRejectedValue(
      new AppError({
        status: 409,
        code: 'USER_ADDRESS_PRIMARY_NOT_DELETABLE',
        message: 'x',
      }),
    );
    await renderSection();
    await fireEvent.press(await screen.findByRole('button', { name: 'Xoá địa chỉ' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Xoá' }));

    expect(
      await screen.findByText('Không thể xoá địa chỉ mặc định. Hãy chọn địa chỉ khác làm mặc định trước.'),
    ).toBeOnTheScreen();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('load error → message + retry', async () => {
    jest.mocked(getMyAddresses).mockRejectedValueOnce(new AppError({ status: 0, code: 'NETWORK_ERROR', message: 'x' }));
    await renderSection();
    expect(await screen.findByText('Không có kết nối mạng. Vui lòng kiểm tra và thử lại.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('radio', { name: label('2 Láng Hạ') })).toBeOnTheScreen();
  });

  it('no address → empty text', async () => {
    jest.mocked(getMyAddresses).mockResolvedValue({ addresses: [] });
    await renderSection();
    expect(await screen.findByText('Chưa có địa chỉ')).toBeOnTheScreen();
  });
});
