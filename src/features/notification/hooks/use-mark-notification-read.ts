import { queryKeys, useAppMutation } from '@/shared/lib/query';
import { markNotificationRead } from '../services/notification.service';
import type { TNotificationsCache } from '../types/notification.types';
import { markReadInCache } from '../utils/notification-cache.util';

/** Optimistic: read at once in the cache; error → previous cache back (+ global toast). */
export const useMarkNotificationRead = () =>
  useAppMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    invalidates: false,
    onMutate: async (notificationId, { client }) => {
      const queryKey = queryKeys.notifications.list();
      await client.cancelQueries({ queryKey });
      const previous = client.getQueryData<TNotificationsCache>(queryKey);
      client.setQueryData<TNotificationsCache>(queryKey, (cache) =>
        markReadInCache(cache, (item) => item.id === notificationId),
      );
      return { previous };
    },
    onError: (_error, _notificationId, onMutateResult, { client }) => {
      if (onMutateResult?.previous) client.setQueryData(queryKeys.notifications.list(), onMutateResult.previous);
    },
  });
