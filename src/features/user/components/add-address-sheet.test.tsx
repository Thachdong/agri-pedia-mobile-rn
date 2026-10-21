import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { createRef } from 'react';
import type { TAddressFieldsProps } from '@/features/location';
import { AppError } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { renderWithProviders } from '@/test-utils';
import { createMyAddress } from '../services/user.service';
import { AddAddressSheet, type TAddAddressSheetProps } from './add-address-sheet';

jest.mock('../services/user.service');
jest.mock('@/shared/lib/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
// Fields stubbed: one press fills the whole address; errors rendered as text.
jest.mock('@/features/location', () => {
  const { Pressable, Text, View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    AddressFields: ({ onChange, errors = {} }: TAddressFieldsProps) => (
      <View>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            onChange({
              province: 'ha_noi',
              ward: 'ba_dinh',
              houseNumber: '2 Kim Mã',
              lat: 21,
              long: 105,
            })
          }
        >
          <Text>Điền địa chỉ</Text>
        </Pressable>
        {Object.values(errors).map((message) => message && <Text key={message}>{message}</Text>)}
      </View>
    ),
  };
});

const onClose = jest.fn();
const renderSheet = () =>
  renderWithProviders(
    <AddAddressSheet sheetRef={createRef() as TAddAddressSheetProps['sheetRef']} onClose={onClose} userId="u1" />,
  );

describe('AddAddressSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('empty → validation errors, no request', async () => {
    await renderSheet();
    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));
    expect(await screen.findByText('Vui lòng chọn tỉnh/thành phố')).toBeOnTheScreen();
    expect(createMyAddress).not.toHaveBeenCalled();
  });

  it('filled → POST as a normal address, toast, close', async () => {
    jest.mocked(createMyAddress).mockResolvedValue({ addressId: 'a2' });
    await renderSheet();
    await fireEvent.press(screen.getByRole('button', { name: 'Điền địa chỉ' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(createMyAddress).toHaveBeenCalledWith({
      province: 'ha_noi',
      ward: 'ba_dinh',
      houseNumber: '2 Kim Mã',
      lat: 21,
      long: 105,
      isPrimary: false,
    });
    expect(toast.success).toHaveBeenCalledWith('Đã thêm địa chỉ');
  });

  it('USER_LOCATION_INVALID → message on the field, stays open', async () => {
    jest.mocked(createMyAddress).mockRejectedValue(
      new AppError({
        status: 400,
        code: 'USER_LOCATION_INVALID',
        message: 'x',
      }),
    );
    await renderSheet();
    await fireEvent.press(screen.getByRole('button', { name: 'Điền địa chỉ' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));

    expect(await screen.findByText('Tỉnh/thành phố hoặc phường/xã không hợp lệ. Vui lòng chọn lại.')).toBeOnTheScreen();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('other error → message under the form', async () => {
    jest.mocked(createMyAddress).mockRejectedValue(new AppError({ status: 404, code: 'USER_NOT_FOUND', message: 'x' }));
    await renderSheet();
    await fireEvent.press(screen.getByRole('button', { name: 'Điền địa chỉ' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Không tìm thấy tài khoản.');
  });
});
