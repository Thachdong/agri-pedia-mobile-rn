import { act, renderHook } from '@testing-library/react-native';
import { queryKeys } from '@/shared/lib/query';
import { useRealtimeEvent } from '@/shared/lib/realtime';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { NOTIFICATION_EVENTS } from '../services/notification.realtime';
import { notification, notificationsCache, notificationsPage } from '../test/notification.fixtures';
import type { TNotificationsCache } from '../types/notification.types';
import { useNotificationRealtime } from './use-notification-realtime';

jest.mock('@/shared/lib/realtime', () => ({ useRealtimeEvent: jest.fn() }));

/** Handler registered for `event` by the last render. */
const handlerOf = (event: string) => {
  const call = jest.mocked(useRealtimeEvent).mock.calls.filter(([name]) => name === event).at(-1);
  if (!call) throw new Error(`no handler for ${event}`);
  return call[1] as (payload?: unknown) => void;
};

describe('useNotificationRealtime', () => {
  beforeEach(() => jest.mocked(useRealtimeEvent).mockReset());

  it('notification.created → added at the top of the list', async () => {
    const client = createTestQueryClient();
    client.setQueryData<TNotificationsCache>(
      queryKeys.notifications.list(),
      notificationsCache(notificationsPage({ notifications: [notification({ id: 'n1', isRead: true })] })),
    );
    await renderHook(() => useNotificationRealtime(), { wrapper: hookWrapper(client) });

    await act(async () => handlerOf(NOTIFICATION_EVENTS.created)(notification({ id: 'n2' })));

    const cache = client.getQueryData<TNotificationsCache>(queryKeys.notifications.list());
    expect(cache?.pages[0]?.notifications.map((item) => item.id)).toEqual(['n2', 'n1']);
  });

  it('first connect → nothing; connect again → refetch notifications', async () => {
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, 'invalidateQueries');
    await renderHook(() => useNotificationRealtime(), { wrapper: hookWrapper(client) });

    await act(async () => handlerOf('connect')());
    expect(spy).not.toHaveBeenCalled();

    await act(async () => handlerOf('connect')());
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.notifications.all });
  });
});
