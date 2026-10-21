import { appInfiniteQueryOptions, queryKeys } from '@/shared/lib/query';
import { getNotifications } from '../services/notification.service';

/** Newest first, cursor pages. `silent`: the list shows errors inline, no toast on top. */
export const notificationsQuery = () =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ pageParam, signal }) => getNotifications(pageParam, signal),
    meta: { silent: true },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
