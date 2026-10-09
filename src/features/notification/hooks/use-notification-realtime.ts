import { useRef } from 'react';
import { queryKeys, useAppQueryClient } from '@/shared/lib/query';
import { useRealtimeEvent } from '@/shared/lib/realtime';
import { NOTIFICATION_EVENTS } from '../services/notification.realtime';
import type { TNotification, TNotificationsCache } from '../types/notification.types';
import { prependNotification } from '../utils/notification-cache.util';

/**
 * Keeps the notifications cache in sync with the socket — mount ONCE (root layout), so the header badge updates everywhere:
 * - `notification.created` → added at the top of the list (badge +1 at once).
 * - connected AGAIN after a drop → refetch: the server doesn't push notifications created while offline.
 */
export function useNotificationRealtime() {
  const client = useAppQueryClient();
  const hasConnected = useRef(false);

  useRealtimeEvent<TNotification>(NOTIFICATION_EVENTS.created, (notification) => {
    client.setQueryData<TNotificationsCache>(queryKeys.notifications.list(), (cache) =>
      prependNotification(cache, notification),
    );
  });

  useRealtimeEvent('connect', () => {
    if (hasConnected.current) void client.invalidateQueries({ queryKey: queryKeys.notifications.all });
    hasConnected.current = true;
  });
}
