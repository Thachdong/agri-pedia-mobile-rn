import { queryKeys, useAppMutation } from '@/shared/lib/query';
import { markAllNotificationsRead } from '../services/notification.service';
import type { TNotificationsCache } from '../types/notification.types';
import { markReadInCache } from '../utils/notification-cache.util';

/**
 * Optimistic: every loaded item read at once; error → previous cache back (+ global toast).
 * Success still invalidates: the server also changed pages not loaded yet.
 */
export const useMarkAllNotificationsRead = () =>
  useAppMutation({
    mutationFn: () => markAllNotificationsRead(),
    invalidates: () => [queryKeys.notifications.all],
    onMutate: async (_variables, { client }) => {
      const queryKey = queryKeys.notifications.list();
      await client.cancelQueries({ queryKey });
      const previous = client.getQueryData<TNotificationsCache>(queryKey);
      client.setQueryData<TNotificationsCache>(queryKey, (cache) => markReadInCache(cache, () => true));
      return { previous };
    },
    onError: (_error, _variables, onMutateResult, { client }) => {
      if (onMutateResult?.previous) client.setQueryData(queryKeys.notifications.list(), onMutateResult.previous);
    },
  });
