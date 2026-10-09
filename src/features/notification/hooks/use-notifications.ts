import { useAppInfiniteQuery } from '@/shared/lib/query';
import type { TNotificationsPage, TNotificationsView } from '../types/notification.types';
import { notificationsQuery } from './notification.queries';

const toView = ({ pages }: { pages: TNotificationsPage[] }): TNotificationsView => {
  const items = pages.flatMap((page) => page.notifications);
  const unreadCount = items.filter((item) => !item.isRead).length;
  const hasMore = pages.at(-1)?.nextCursor != null;
  return { items, unreadCount, unreadCountIsLowerBound: hasMore && unreadCount === items.length };
};

/** Notifications list + header badge (one query). `enabled: false` for guests (endpoint needs a login). */
export const useNotifications = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useAppInfiniteQuery({ ...notificationsQuery(), select: toView, enabled });
