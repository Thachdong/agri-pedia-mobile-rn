import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useSession } from '@/features/auth';
import { useChatRooms, useSendMessage } from '@/features/chat';
import { useCrops, useDiagnosis } from '@/features/diagnosis';
import { useNearbyDistributors } from '@/features/distributor';
import { AppError } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { SendReportButton } from './send-report-button';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@/shared/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/shared/lib/device', () => ({ getCurrentPosition: jest.fn(async () => null) }));
jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));
jest.mock('@/features/location', () => ({
  useProvinces: () => ({ data: [{ codename: 'ha_noi', name: 'Hà Nội' }], isPending: false, isError: false }),
  useWards: () => ({ data: [], isPending: false }),
}));
jest.mock('@/features/diagnosis', () => ({ useDiagnosis: jest.fn(), useCrops: jest.fn() }));
jest.mock('@/features/distributor', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    useNearbyDistributors: jest.fn(),
    DistributorCard: ({ distributor, onPress }: { distributor: { username: string }; onPress: (d: unknown) => void }) => (
      <Text onPress={() => onPress(distributor)}>{`supplier:${distributor.username}`}</Text>
    ),
  };
});
jest.mock('@/features/chat', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    useChatRooms: jest.fn(),
    useSendMessage: jest.fn(),
    formatReportMessage: (crop: string) => `report:${crop}`,
    ChatRoomItem: ({ room, onPress }: { room: { otherUsername: string }; onPress: (r: unknown) => void }) => (
      <Text onPress={() => onPress(room)}>{`room:${room.otherUsername}`}</Text>
    ),
  };
});

const mutateAsync = jest.fn();
const farmer = { status: 'authenticated', user: { id: 'f1', role: 'FARMER' }, isLoggedIn: true };
const completed = { id: 'g1', status: 'COMPLETED', cropType: 'RICE', createdAt: '2026-10-20T07:30:00.000Z' };

describe('SendReportButton / SendReportSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue(farmer as never);
    jest.mocked(useDiagnosis).mockReturnValue({ data: completed } as never);
    jest.mocked(useCrops).mockReturnValue({ data: [{ code: 'RICE', nameVi: 'Lúa' }] } as never);
    jest.mocked(useChatRooms).mockReturnValue({
      data: { rooms: [{ roomId: 'r1', otherUsername: 'Đại lý An' }], totalUnread: 0 },
      isPending: false,
      hasNextPage: false,
    } as never);
    jest.mocked(useSendMessage).mockReturnValue({ mutateAsync, isPending: false } as never);
    jest.mocked(useNearbyDistributors).mockReturnValue({
      data: { items: [{ userId: 'd9', username: 'Cửa hàng Bình', address: { province: 'ha_noi' } }], scope: 'province' },
      isPending: false,
      isError: false,
      hasNextPage: false,
    } as never);
    mutateAsync.mockResolvedValue({ roomId: 'r1', messageId: 'm1', createdAt: '' });
  });

  it.each([
    ['DISTRIBUTOR', { ...farmer, user: { id: 'd1', role: 'DISTRIBUTOR' } }, completed],
    ['not completed', farmer, { ...completed, status: 'PROCESSING' }],
  ])('%s → no button', async (_, session, data) => {
    jest.mocked(useSession).mockReturnValue(session as never);
    jest.mocked(useDiagnosis).mockReturnValue({ data } as never);
    await render(<SendReportButton diagnosisId="g1" />);
    expect(screen.queryByRole('button', { name: 'Gửi báo cáo' })).toBeNull();
  });

  it('room → confirm → DIAGNOSIS_REPORT sent → toast + conversation opened', async () => {
    await render(<SendReportButton diagnosisId="g1" />);
    await fireEvent.press(screen.getByText('room:Đại lý An'));
    expect(screen.getByText('Báo cáo chẩn đoán Lúa sẽ được gửi cho Đại lý An qua tin nhắn.')).toBeOnTheScreen();
    await fireEvent.press(screen.getAllByRole('button', { name: 'Gửi báo cáo' }).at(-1)!);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/chat/r1'));
    expect(mutateAsync).toHaveBeenCalledWith({
      roomId: 'r1',
      message: 'report:Lúa',
      type: 'DIAGNOSIS_REPORT',
      diagnosisId: 'g1',
    });
    expect(toast.success).toHaveBeenCalledWith('Đã gửi báo cáo cho Đại lý An');
  });

  it('send fails → Vietnamese error in the confirm sheet, stays', async () => {
    mutateAsync.mockRejectedValue(new AppError({ status: 422, code: 'CHAT_DIAGNOSIS_NOT_COMPLETED', message: 'x' }));
    await render(<SendReportButton diagnosisId="g1" />);
    await fireEvent.press(screen.getByText('room:Đại lý An'));
    await fireEvent.press(screen.getAllByRole('button', { name: 'Gửi báo cáo' }).at(-1)!);
    expect(await screen.findByText('Chẩn đoán chưa hoàn tất, chưa thể gửi báo cáo.')).toBeOnTheScreen();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('"Tìm nhà cung cấp": no position → area search → supplier → sent with receiverId', async () => {
    await render(<SendReportButton diagnosisId="g1" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Tìm nhà cung cấp' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Tìm theo tỉnh thành' }));
    expect(screen.getByText('Chọn tỉnh/thành phố để xem nhà cung cấp.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText(/Tỉnh\/thành phố/));
    await fireEvent.press(screen.getByText('Hà Nội'));
    expect(useNearbyDistributors).toHaveBeenLastCalledWith({ provinceCode: 'ha_noi' });
    await fireEvent.press(screen.getByText('supplier:Cửa hàng Bình'));
    await fireEvent.press(screen.getAllByRole('button', { name: 'Gửi báo cáo' }).at(-1)!);
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ receiverId: 'd9' })));
  });
});
