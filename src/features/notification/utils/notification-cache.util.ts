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

/** Adds a new notification at the top of page 0 (newest first). No-op when not loaded or the id is already there. */
export const prependNotification = (
  cache: TNotificationsCache | undefined,
  notification: TNotification,
): TNotificationsCache | undefined => {
  if (!cache) return cache;
  if (cache.pages.some((page) => page.notifications.some((item) => item.id === notification.id))) return cache;
  const [first, ...rest] = cache.pages;
  if (!first) return cache;
  return { ...cache, pages: [{ ...first, notifications: [notification, ...first.notifications] }, ...rest] };
};
