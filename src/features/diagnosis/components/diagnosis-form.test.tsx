import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { pickImages, resizeImage, takePhoto } from '@/shared/lib/device';
import { AppError } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { renderWithProviders } from '@/test-utils';
import { createDiagnosis } from '../services/diagnosis.service';
import { crop, diagnosisSettings } from '../test/diagnosis.fixtures';
import { DiagnosisForm } from './diagnosis-form';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@/shared/lib/device', () => ({ pickImages: jest.fn(), takePhoto: jest.fn(), resizeImage: jest.fn() }));
jest.mock('@/shared/lib/toast', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));
jest.mock('../services/diagnosis.service');

const picked = (...names: string[]) =>
  names.map((name) => ({ uri: `file:///${name}.jpg`, name, mimeType: 'image/jpeg', size: 1, extension: 'jpg' }));

const renderForm = (props: Partial<Parameters<typeof DiagnosisForm>[0]> = {}) =>
  renderWithProviders(<DiagnosisForm crop={crop()} settings={diagnosisSettings()} {...props} />);

describe('DiagnosisForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(resizeImage).mockImplementation(async (uri) => ({ uri: `${uri}.small`, width: 10, height: 10 }));
    jest.mocked(createDiagnosis).mockResolvedValue({ id: 'g1', status: 'PROCESSING' });
  });

  it('guest: photos, note and submit only ask to log in', async () => {
    const onRequireLogin = jest.fn();
    await renderForm({ guest: true, onRequireLogin });
    await fireEvent.press(screen.getByRole('button', { name: 'Chụp ảnh' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Chọn ảnh' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Ghi chú, cần đăng nhập' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Chẩn đoán' }));
    expect(onRequireLogin).toHaveBeenCalledTimes(4);
    expect(takePhoto).not.toHaveBeenCalled();
    expect(pickImages).not.toHaveBeenCalled();
  });

  it('no photo → error, nothing sent', async () => {
    await renderForm();
    await fireEvent.press(screen.getByRole('button', { name: 'Chẩn đoán' }));
    expect(await screen.findByText('Thêm ít nhất 1 ảnh')).toBeOnTheScreen();
    expect(createDiagnosis).not.toHaveBeenCalled();
  });

  it('library pick limited to the free slots; camera adds one; add buttons hidden when full', async () => {
    jest.mocked(pickImages).mockResolvedValue(picked('a', 'b'));
    jest.mocked(takePhoto).mockResolvedValue(picked('c')[0]!);
    await renderForm();
    await fireEvent.press(screen.getByRole('button', { name: 'Chọn ảnh' }));
    expect(pickImages).toHaveBeenCalledWith({ limit: 3 });
    await fireEvent.press(screen.getByRole('button', { name: 'Chụp ảnh' }));
    expect(await screen.findByText('3 / 3')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Chọn ảnh' })).toBeNull();
  });

  it('submit: resized photos + default part + trimmed note → report screen', async () => {
    jest.mocked(pickImages).mockResolvedValue(picked('a'));
    await renderForm();
    await fireEvent.press(screen.getByRole('button', { name: 'Chọn ảnh' }));
    await fireEvent.changeText(screen.getByLabelText('Ghi chú (không bắt buộc)'), '  Lá vàng  ');
    await fireEvent.press(screen.getByRole('button', { name: 'Chẩn đoán' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/diagnosis/g1'));
    expect(resizeImage).toHaveBeenCalledWith('file:///a.jpg', { maxWidth: 4096, maxHeight: 4096, maxBytes: 5_000_000 });
    expect(jest.mocked(createDiagnosis).mock.calls[0]?.[0]).toEqual({
      cropType: 'RICE',
      images: [{ uri: 'file:///a.jpg.small', plantPart: 'WHOLE_PLANT' }],
      note: 'Lá vàng',
    });
  });

  it('a photo that cannot be read → error on it, nothing sent', async () => {
    jest.mocked(pickImages).mockResolvedValue(picked('a'));
    jest.mocked(resizeImage).mockResolvedValue(null);
    await renderForm();
    await fireEvent.press(screen.getByRole('button', { name: 'Chọn ảnh' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Chẩn đoán' }));
    expect(await screen.findByText('Không đọc được ảnh này, hãy chọn ảnh khác')).toBeOnTheScreen();
    expect(createDiagnosis).not.toHaveBeenCalled();
  });

  it('DIAGNOSIS_INVALID_IMAGE with an index → error on that photo', async () => {
    jest.mocked(pickImages).mockResolvedValue(picked('a', 'b'));
    jest.mocked(createDiagnosis).mockRejectedValue(
      new AppError({ status: 400, code: 'DIAGNOSIS_INVALID_IMAGE', message: 'bad', details: { images: [{ index: 1 }] } }),
    );
    await renderForm();
    await fireEvent.press(screen.getByRole('button', { name: 'Chọn ảnh' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Chẩn đoán' }));
    expect(await screen.findByText('Ảnh không hợp lệ hoặc không đọc được, hãy chọn ảnh khác')).toBeOnTheScreen();
    expect(screen.getAllByText('Ảnh không hợp lệ hoặc không đọc được, hãy chọn ảnh khác')).toHaveLength(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('daily limit → message under the form; crop not supported → toast', async () => {
    jest.mocked(pickImages).mockResolvedValue(picked('a'));
    jest
      .mocked(createDiagnosis)
      .mockRejectedValueOnce(new AppError({ status: 422, code: 'DIAGNOSIS_DAILY_LIMIT_EXCEEDED', message: 'limit' }))
      .mockRejectedValueOnce(new AppError({ status: 400, code: 'DIAGNOSIS_CROP_NOT_SUPPORTED', message: 'crop' }));
    await renderForm();
    await fireEvent.press(screen.getByRole('button', { name: 'Chọn ảnh' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Chẩn đoán' }));
    expect(
      await screen.findByText('Bạn đã dùng hết lượt chẩn đoán hôm nay, vui lòng thử lại ngày mai'),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Chẩn đoán' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Cây trồng chưa được hỗ trợ'));
  });

  it('no diagnosis left today → submit disabled with a note', async () => {
    await renderForm({ settings: diagnosisSettings({ remainingToday: 0 }) });
    expect(screen.getByRole('button', { name: 'Chẩn đoán' })).toBeDisabled();
    expect(
      screen.getByText('Bạn đã dùng hết lượt chẩn đoán hôm nay, vui lòng thử lại ngày mai.'),
    ).toBeOnTheScreen();
  });
});
