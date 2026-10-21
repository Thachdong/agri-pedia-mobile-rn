import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppError } from '@/shared/lib/http';
import { queryKeys } from '@/shared/lib/query';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { markAllNotificationsRead, markNotificationRead } from '../services/notification.service';
import { notification, notificationsCache, notificationsPage } from '../test/notification.fixtures';
import type { TNotificationsCache } from '../types/notification.types';
import { useMarkAllNotificationsRead } from './use-mark-all-notifications-read';
import { useMarkNotificationRead } from './use-mark-notification-read';

jest.mock('../services/notification.service');

const seed = () => {
  const client = createTestQueryClient();
  client.setQueryData<TNotificationsCache>(
    queryKeys.notifications.list(),
    notificationsCache(notificationsPage({ notifications: [notification({ id: 'n1' }), notification({ id: 'n2' })] })),
  );
  return client;
};
const readFlags = (client: ReturnType<typeof createTestQueryClient>) =>
  client
    .getQueryData<TNotificationsCache>(queryKeys.notifications.list())
    ?.pages.flatMap((page) => page.notifications.map((item) => item.isRead));

describe('useMarkNotificationRead', () => {
  beforeEach(() => jest.resetAllMocks());

  it('marks the item read in the cache at once, before the request resolves', async () => {
    let resolve: () => void = () => {};
    jest.mocked(markNotificationRead).mockReturnValue(new Promise<void>((r) => (resolve = r)));
    const client = seed();
    const { result } = await renderHook(() => useMarkNotificationRead(), { wrapper: hookWrapper(client) });

    await act(async () => result.current.mutate('n1'));

    await waitFor(() => expect(readFlags(client)).toEqual([true, false]));
    expect(markNotificationRead).toHaveBeenCalledWith('n1');
    await act(async () => resolve());
  });

  it('error → previous cache back', async () => {
    jest.mocked(markNotificationRead).mockRejectedValue(new AppError({ status: 404, code: 'NOTIFICATION_NOT_FOUND', message: 'x' }));
    const client = seed();
    const { result } = await renderHook(() => useMarkNotificationRead(), { wrapper: hookWrapper(client) });

    await act(async () => result.current.mutate('n1'));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(readFlags(client)).toEqual([false, false]);
  });
});

describe('useMarkAllNotificationsRead', () => {
  beforeEach(() => jest.resetAllMocks());

  it('marks every loaded item read and invalidates notifications', async () => {
    jest.mocked(markAllNotificationsRead).mockResolvedValue(undefined);
    const client = seed();
    const spy = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useMarkAllNotificationsRead(), { wrapper: hookWrapper(client) });

    await act(() => result.current.mutateAsync());

    expect(readFlags(client)).toEqual([true, true]);
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.notifications.all });
  });

  it('error → previous cache back', async () => {
    jest.mocked(markAllNotificationsRead).mockRejectedValue(new AppError({ status: 500, code: 'X', message: 'x' }));
    const client = seed();
    const { result } = await renderHook(() => useMarkAllNotificationsRead(), { wrapper: hookWrapper(client) });

    await act(async () => result.current.mutate());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(readFlags(client)).toEqual([false, false]);
  });
});
