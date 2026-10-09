import type { TNotification, TNotificationsCache } from '../types/notification.types';

/** Sets `isRead` on the unread items matching `match` — returns a new object (immutable) for setQueryData. */
export const markReadInCache = (
  cache: TNotificationsCache | undefined,
  match: (item: TNotification) => boolean,
): TNotificationsCache | undefined =>
  cache && {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      notifications: page.notifications.map((item) => (!item.isRead && match(item) ? { ...item, isRead: true } : item)),
    })),
  };
