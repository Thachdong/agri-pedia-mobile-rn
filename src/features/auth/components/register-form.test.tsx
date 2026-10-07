import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AppError, getErrorMessage } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { jsonResponse, mockFetch, renderWithProviders } from '@/test-utils';
import { register } from '../services/auth.service';
import { authHandoffStore } from '../utils/auth-handoff.store';
import { RegisterForm } from './register-form';

const mockRouter = { replace: jest.fn(), push: jest.fn(), back: jest.fn() };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('@/shared/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('../services/auth.service');

/** GET /provinces and GET /provinces/ha_noi/wards through the real http client. */
function mockLocationApi() {
  mockFetch().mockImplementation(async (url) =>
    url.endsWith('/provinces')
      ? jsonResponse(200, { provinces: [{ codename: 'ha_noi', name: 'Hà Nội' }] })
      : jsonResponse(200, { wards: [{ codename: 'ba_dinh', name: 'Ba Đình' }] }),
  );
}

/** Fills a valid DISTRIBUTOR (PHONE) form. Sheets render inline in tests (bottom-sheet mock). */
async function fillValidDistributor() {
  await fireEvent.press(screen.getByRole('tab', { name: 'PHONE' }));
  await fireEvent.changeText(screen.getByLabelText('Số điện thoại'), '090 123 4567');
  await fireEvent.changeText(screen.getByLabelText('Mật khẩu'), '12345678');
  await fireEvent.changeText(screen.getByLabelText('Xác nhận mật khẩu'), '12345678');
  await fireEvent.press(screen.getByRole('radio', { name: /^Nhà phân phối/ }));
  await fireEvent.press(screen.getByText('Giống cây trồng'));
  await fireEvent.press(await screen.findByText('Hà Nội'));
  await fireEvent.press(await screen.findByText('Ba Đình'));
  await fireEvent.changeText(screen.getByLabelText('Số nhà, tên đường'), '12 Nguyễn Trãi');
  await fireEvent(screen.getByTestId('map-view'), 'press', {
    nativeEvent: { coordinate: { latitude: 21.03, longitude: 105.85 } },
  });
  await fireEvent.press(screen.getByRole('button', { name: 'Xác nhận' }));
}

describe('RegisterForm', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    mockLocationApi();
  });

  it('switching EMAIL → PHONE clears the identifier and changes its label', async () => {
    await renderWithProviders(<RegisterForm />);
    await fireEvent.changeText(screen.getByLabelText('Email'), 'a@b.co');

    await fireEvent.press(screen.getByRole('tab', { name: 'PHONE' }));

    expect(screen.queryByLabelText('Email')).toBeNull();
    expect(screen.getByLabelText('Số điện thoại')).toHaveDisplayValue('');
  });

  it('shows the business type only for DISTRIBUTOR', async () => {
    await renderWithProviders(<RegisterForm />);
    expect(screen.queryByText('Loại hình kinh doanh')).toBeNull();

    await fireEvent.press(screen.getByRole('radio', { name: /^Nhà phân phối/ }));
    expect(screen.getByText('Loại hình kinh doanh')).toBeTruthy();

    await fireEvent.press(screen.getByRole('radio', { name: /^Nông dân/ }));
    expect(screen.queryByText('Loại hình kinh doanh')).toBeNull();
  });

  it('empty submit shows Vietnamese errors and does not call the API', async () => {
    await renderWithProviders(<RegisterForm />);
    await fireEvent.press(screen.getByRole('button', { name: 'REGISTER' }));

    expect(await screen.findByText('Vui lòng chọn tỉnh/thành phố')).toBeTruthy();
    expect(screen.getByText('Vui lòng chọn vị trí trên bản đồ')).toBeTruthy();
    expect(register).not.toHaveBeenCalled();
  });

  it('DISTRIBUTOR success: sends the DTO, saves the activate handoff, goes to /auth/activate', async () => {
    jest.mocked(register).mockResolvedValue(undefined);
    await renderWithProviders(<RegisterForm />);
    await fillValidDistributor();

    await fireEvent.press(screen.getByRole('button', { name: 'REGISTER' }));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/auth/activate'));
    expect(register).toHaveBeenCalledWith({
      loginType: 'PHONE',
      identifier: '0901234567',
      password: '12345678',
      role: 'DISTRIBUTOR',
      bussinessType: 'SEEDS_SEEDLINGS',
      address: { province: 'ha_noi', ward: 'ba_dinh', houseNumber: '12 Nguyễn Trãi', lat: 21.03, long: 105.85 },
    });
    expect(await authHandoffStore.read('ACTIVATE_DISTRIBUTOR')).toEqual({
      loginType: 'PHONE',
      identifier: '0901234567',
      at: expect.any(String),
      purpose: 'ACTIVATE_DISTRIBUTOR',
    });
  });

  it('FARMER success: toast and /auth/login, no handoff', async () => {
    jest.mocked(register).mockResolvedValue(undefined);
    await renderWithProviders(<RegisterForm />);
    await fillValidDistributor();
    await fireEvent.press(screen.getByRole('radio', { name: /^Nông dân/ }));

    await fireEvent.press(screen.getByRole('button', { name: 'REGISTER' }));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/auth/login'));
    expect(jest.mocked(register).mock.calls[0]?.[0]).toMatchObject({ role: 'FARMER', bussinessType: null });
    expect(toast.success).toHaveBeenCalled();
    expect(await authHandoffStore.read('ACTIVATE_DISTRIBUTOR')).toBeNull();
  });

  it('USER_IDENTIFIER_ALREADY_USED goes under the identifier, no navigation', async () => {
    jest
      .mocked(register)
      .mockRejectedValue(new AppError({ status: 409, code: 'USER_IDENTIFIER_ALREADY_USED', message: 'used' }));
    await renderWithProviders(<RegisterForm />);
    await fillValidDistributor();

    await fireEvent.press(screen.getByRole('button', { name: 'REGISTER' }));

    expect(await screen.findByText('Email/số điện thoại này đã được đăng ký')).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('unknown server error goes under the form', async () => {
    const error = new AppError({ status: 500, code: 'INTERNAL', message: 'boom' });
    jest.mocked(register).mockRejectedValue(error);
    await renderWithProviders(<RegisterForm />);
    await fillValidDistributor();

    await fireEvent.press(screen.getByRole('button', { name: 'REGISTER' }));

    expect(await screen.findByText(getErrorMessage(error))).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
