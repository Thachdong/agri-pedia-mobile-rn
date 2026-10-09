import { act, renderHook, waitFor } from '@testing-library/react-native';
import { hookWrapper } from '@/test-utils';
import { getNotifications } from '../services/notification.service';
import { notification, notificationsPage } from '../test/notification.fixtures';
import { useNotifications } from './use-notifications';

jest.mock('../services/notification.service');

describe('useNotifications', () => {
  beforeEach(() => jest.resetAllMocks());

  it('merges pages, counts unread over loaded items, stops when nextCursor is null', async () => {
    jest
      .mocked(getNotifications)
      .mockResolvedValueOnce(
        notificationsPage({
          notifications: [notification({ id: 'n1' }), notification({ id: 'n2', isRead: true })],
          nextCursor: 'c1',
        }),
      )
      .mockResolvedValueOnce(notificationsPage({ notifications: [notification({ id: 'n3' })], nextCursor: null }));
    const { result } = await renderHook(() => useNotifications(), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    expect(result.current.data?.unreadCount).toBe(1);
    expect(result.current.data?.unreadCountIsLowerBound).toBe(false);

    await act(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.data?.items).toHaveLength(3));
    expect(getNotifications).toHaveBeenLastCalledWith('c1', expect.anything());
    expect(result.current.data?.unreadCount).toBe(2);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('every loaded item unread and more pages → lower bound ("N+")', async () => {
    jest
      .mocked(getNotifications)
      .mockResolvedValueOnce(notificationsPage({ notifications: [notification({ id: 'n1' })], nextCursor: 'c1' }));
    const { result } = await renderHook(() => useNotifications(), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.data?.unreadCountIsLowerBound).toBe(true));
    expect(result.current.data?.unreadCount).toBe(1);
  });

  it('enabled: false → no request', async () => {
    const { result } = await renderHook(() => useNotifications({ enabled: false }), { wrapper: hookWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(getNotifications).not.toHaveBeenCalled();
  });
});
