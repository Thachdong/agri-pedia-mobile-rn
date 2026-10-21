import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '@/test-utils';
import { pickImages, resizeImage } from '@/shared/lib/device';
import { createDiagnosis, getDiagnosisSettings } from '../services/diagnosis.service';
import { getCrops } from '../services/knowledge.service';
import { crop, diagnosisSettings, durian } from '../test/diagnosis.fixtures';
import { HomeDiagnosisPanel } from './home-diagnosis-panel';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/features/auth', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { LoginRequiredSheet: () => <Text>login-sheet</Text> };
});
const mockOpen = jest.fn();
jest.mock('@/shared/lib/sheet', () => ({
  ...jest.requireActual<object>('@/shared/lib/sheet'),
  useAppSheet: () => ({ ref: { current: null }, open: mockOpen, close: jest.fn() }),
}));
jest.mock('@/shared/lib/toast', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));
jest.mock('../services/diagnosis.service');
jest.mock('../services/knowledge.service');
jest.mock('@/shared/lib/device', () => ({ pickImages: jest.fn(), takePhoto: jest.fn(), resizeImage: jest.fn() }));

const selectedTab = () => screen.getByRole('tab', { selected: true });

describe('HomeDiagnosisPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCrops).mockResolvedValue({ crops: [durian(), crop()] });
    jest.mocked(getDiagnosisSettings).mockResolvedValue(diagnosisSettings());
  });

  it('no admin default → RICE preselected; remaining diagnoses today shown', async () => {
    await renderWithProviders(<HomeDiagnosisPanel />);
    expect(await screen.findByRole('tab', { name: 'Lúa', selected: true })).toBeOnTheScreen();
    expect(screen.getByText(/Hôm nay bạn còn 2 lượt\./)).toBeOnTheScreen();
    expect(screen.queryByText('login-sheet')).toBeNull();
  });

  it("admins' default crop; a logged-in user switches crop", async () => {
    jest.mocked(getDiagnosisSettings).mockResolvedValue(diagnosisSettings({ defaultCropType: 'DURIAN' }));
    await renderWithProviders(<HomeDiagnosisPanel />);
    expect(await screen.findByRole('tab', { name: 'Sầu riêng', selected: true })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('tab', { name: 'Lúa' }));
    expect(selectedTab()).toHaveTextContent('Lúa');
  });

  it('guest: crop change opens the login sheet, crop unchanged; no remaining count', async () => {
    jest.mocked(getDiagnosisSettings).mockResolvedValue(diagnosisSettings({ remainingToday: null }));
    await renderWithProviders(<HomeDiagnosisPanel guest />);
    await screen.findByRole('tab', { name: 'Lúa', selected: true });
    await fireEvent.press(screen.getByRole('tab', { name: 'Sầu riêng' }));
    expect(mockOpen).toHaveBeenCalled();
    expect(selectedTab()).toHaveTextContent('Lúa');
    expect(screen.queryByText(/Hôm nay bạn còn/)).toBeNull();
    expect(screen.getByText('login-sheet')).toBeOnTheScreen();
  });

  it('settings failing never blocks the form', async () => {
    jest.mocked(getDiagnosisSettings).mockRejectedValue(new Error('down'));
    await renderWithProviders(<HomeDiagnosisPanel />);
    expect(await screen.findByRole('tab', { name: 'Lúa', selected: true })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Chẩn đoán' })).toBeOnTheScreen();
  });

  it('crops failing → message + retry; no crop at all → empty state', async () => {
    jest.mocked(getCrops).mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce({ crops: [] });
    await renderWithProviders(<HomeDiagnosisPanel />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Chưa có cây trồng được hỗ trợ chẩn đoán.')).toBeOnTheScreen();
  });

  it('crop tabs locked while a diagnosis is being sent', async () => {
    jest.mocked(pickImages).mockResolvedValue([
      { uri: 'file:///a.jpg', name: 'a.jpg', mimeType: 'image/jpeg', size: 1, extension: 'jpg' },
    ]);
    jest.mocked(resizeImage).mockResolvedValue({ uri: 'file:///a.small.jpg', width: 1, height: 1 });
    let finish: (value: { id: string; status: 'PROCESSING' }) => void = () => {};
    jest.mocked(createDiagnosis).mockReturnValue(new Promise((resolve) => (finish = resolve)));
    await renderWithProviders(<HomeDiagnosisPanel />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Chọn ảnh' }));
    expect(screen.getByRole('tab', { name: 'Sầu riêng' })).toBeEnabled();
    // Not awaited: the press resolves only when the request does.
    const sending = fireEvent.press(screen.getByRole('button', { name: 'Chẩn đoán' }));
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Sầu riêng' })).toBeDisabled());
    finish({ id: 'g1', status: 'PROCESSING' });
    await sending;
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Sầu riêng' })).toBeEnabled());
  });
});
