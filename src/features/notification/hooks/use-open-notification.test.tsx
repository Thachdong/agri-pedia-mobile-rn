import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useSession, type TCurrentUser, type TSession } from '@/features/auth';
import { findDistributorReviewQuery } from '@/features/review';
import { toast } from '@/shared/lib/toast';
import { hookWrapper } from '@/test-utils';
import { markNotificationRead } from '../services/notification.service';
import { notification } from '../test/notification.fixtures';
import { useOpenNotification } from './use-open-notification';

const mockPush = jest.fn();
const mockFindReview = jest.fn();
const mockIsFocused = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useNavigation: () => ({ isFocused: mockIsFocused }),
}));
jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));
jest.mock('@/features/review', () => ({ findDistributorReviewQuery: jest.fn() }));
jest.mock('@/shared/lib/toast', () => ({ toast: { info: jest.fn(), error: jest.fn() } }));
jest.mock('../services/notification.service');

const session: TSession = {
  status: 'authenticated',
  user: { id: 'd1', username: 'Đại lý' } as TCurrentUser,
  isLoggedIn: true,
};

describe('useOpenNotification', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useSession).mockReturnValue(session);
    mockIsFocused.mockReturnValue(true);
    jest.mocked(markNotificationRead).mockResolvedValue(undefined);
    jest.mocked(findDistributorReviewQuery).mockImplementation(
      ({ distributorId, reviewId }) =>
        ({ queryKey: ['reviews', 'distributor', distributorId, 'find', reviewId], queryFn: mockFindReview }) as never,
    );
  });

  const render = () => renderHook(() => useOpenNotification(), { wrapper: hookWrapper() });

  it('unread PLATFORM → marked read, no lookup, no navigation', async () => {
    const { result } = await render();
    await act(async () => result.current.open(notification({ type: 'PLATFORM', referenceId: null })));
    await waitFor(() => expect(markNotificationRead).toHaveBeenCalledWith('n1'));
    expect(mockFindReview).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shop review (USER) → recipient profile; read already → no mark read', async () => {
    mockFindReview.mockResolvedValue({ id: 'rv1', targetType: 'USER', targetId: 'd1' });
    const { result } = await render();
    await act(async () => result.current.open(notification({ isRead: true })));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/profile/d1'));
    expect(findDistributorReviewQuery).toHaveBeenCalledWith({ distributorId: 'd1', reviewId: 'rv1' });
    expect(markNotificationRead).not.toHaveBeenCalled();
  });

  it('product review → product page, unread marked read', async () => {
    mockFindReview.mockResolvedValue({ id: 'rv1', targetType: 'PRODUCT', targetId: 'p1' });
    const { result } = await render();
    await act(async () => result.current.open(notification()));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/product/p1'));
    expect(markNotificationRead).toHaveBeenCalledWith('n1');
  });

  it('review not found → toast, no navigation', async () => {
    mockFindReview.mockResolvedValue(null);
    const { result } = await render();
    await act(async () => result.current.open(notification()));
    await waitFor(() => expect(toast.info).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('REVIEW without referenceId → toast, no lookup', async () => {
    const { result } = await render();
    await act(async () => result.current.open(notification({ referenceId: null })));
    expect(toast.info).toHaveBeenCalled();
    expect(mockFindReview).not.toHaveBeenCalled();
  });

  it('openingId = the REVIEW notification while its review is looked up', async () => {
    let resolve: (value: unknown) => void = () => {};
    mockFindReview.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = await render();
    await act(async () => result.current.open(notification({ id: 'n7' })));
    await waitFor(() => expect(result.current.openingId).toBe('n7'));
    await act(async () => resolve(null));
    await waitFor(() => expect(result.current.openingId).toBeUndefined());
  });

  it('screen left before the lookup ended → no navigation, no toast', async () => {
    mockFindReview.mockResolvedValue({ id: 'rv1', targetType: 'PRODUCT', targetId: 'p1' });
    mockIsFocused.mockReturnValue(false);
    const { result } = await render();
    await act(async () => result.current.open(notification()));
    await waitFor(() => expect(mockFindReview).toHaveBeenCalled());
    await act(async () => {});
    expect(mockPush).not.toHaveBeenCalled();
    expect(toast.info).not.toHaveBeenCalled();
  });
});
