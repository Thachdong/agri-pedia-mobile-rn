import { fireEvent, screen } from '@testing-library/react-native';
import { AppError } from '@/shared/lib/http';
import { renderWithProviders } from '@/test-utils';
import { getDiagnosis } from '../services/diagnosis.service';
import { getCrops, getDisease } from '../services/knowledge.service';
import {
  crop,
  diagnosis,
  diagnosisImage,
  diagnosisRegion,
  disease,
  processingDiagnosis,
} from '../test/diagnosis.fixtures';
import { DiagnosisResult } from './diagnosis-result';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: mockReplace }) }));
jest.mock('@/shared/lib/realtime', () => ({ useRealtimeEvent: jest.fn() }));
jest.mock('../services/diagnosis.service');
jest.mock('../services/knowledge.service');

describe('DiagnosisResult', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCrops).mockResolvedValue({ crops: [crop()] });
    jest.mocked(getDisease).mockResolvedValue(disease());
  });

  it('PROCESSING → waiting panel; actions shown', async () => {
    jest.mocked(getDiagnosis).mockResolvedValue(processingDiagnosis());
    await renderWithProviders(<DiagnosisResult id="g1" actions={null} />);
    expect(await screen.findByText('Đang phân tích ảnh…')).toBeOnTheScreen();
    expect(screen.getByText('Đang phân tích')).toBeOnTheScreen();
  });

  it('FAILED → "Chẩn đoán lại" back home', async () => {
    jest.mocked(getDiagnosis).mockResolvedValue(diagnosis({ status: 'FAILED', summary: null }));
    await renderWithProviders(<DiagnosisResult id="g1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Chẩn đoán lại' }));
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('not found → message + home; other error → retry', async () => {
    jest
      .mocked(getDiagnosis)
      .mockRejectedValueOnce(new AppError({ status: 404, code: 'DIAGNOSIS_NOT_FOUND', message: 'nf' }));
    await renderWithProviders(<DiagnosisResult id="x" />);
    expect(await screen.findByText('Không tìm thấy kết quả chẩn đoán')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Về trang chủ' }));
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('COMPLETED: title with crop, note, conclusion, per-image result, disclaimer', async () => {
    jest.mocked(getDiagnosis).mockResolvedValue(diagnosis());
    await renderWithProviders(<DiagnosisResult id="g1" />);
    expect(await screen.findByRole('header', { name: 'Kết quả chẩn đoán — Lúa' })).toBeOnTheScreen();
    expect(screen.getByText(/Ghi chú: Lá vàng/)).toBeOnTheScreen();
    expect(screen.getByText('Phát hiện 1 bệnh có thể có')).toBeOnTheScreen();
    // Summary row + the image's own card.
    expect(screen.getAllByText('Ảnh 1 · Lá')).toHaveLength(2);
    expect(screen.getByText('Kết quả chỉ mang tính tham khảo.')).toBeOnTheScreen();
  });

  it('all healthy / nothing found conclusions; conflict warning', async () => {
    jest.mocked(getDiagnosis).mockResolvedValue(
      diagnosis({
        summary: { hasDisease: false, conflict: true, diseases: [] },
        images: [diagnosisImage({ status: 'HEALTHY', diseases: [], regions: [], message: 'Cây khoẻ' })],
      }),
    );
    await renderWithProviders(<DiagnosisResult id="g1" />);
    expect(await screen.findByText('Không phát hiện dấu hiệu bệnh')).toBeOnTheScreen();
    expect(screen.getByText('Các ảnh cho kết quả khác nhau, nên kiểm tra thêm.')).toBeOnTheScreen();
  });

  it('tap a region → its symptom and features; disease name → disease sheet, article link', async () => {
    jest.mocked(getDiagnosis).mockResolvedValue(
      diagnosis({ images: [diagnosisImage({ regions: [diagnosisRegion({ symptom: 'Vết lạ', features: ['Mép vàng'] })] })] }),
    );
    await renderWithProviders(<DiagnosisResult id="g1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Vùng 1: Đạo ôn, tin cậy cao' }));
    expect(screen.getByText('• Mép vàng')).toBeOnTheScreen();

    await fireEvent.press(screen.getAllByRole('link', { name: 'Đạo ôn, xem thông tin bệnh' })[0]!);
    expect(await screen.findByRole('header', { name: 'Đạo ôn' })).toBeOnTheScreen();
    expect(getDisease).toHaveBeenCalledWith('RICE_BLAST', expect.anything());
    await fireEvent.press(screen.getByRole('button', { name: 'Đọc bài viết đầy đủ' }));
    expect(mockPush).toHaveBeenCalledWith('/articles/lua/dao-on');
  });
});
