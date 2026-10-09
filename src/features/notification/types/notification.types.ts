import type { TApiSchema } from '@/shared/lib/http';

/** One item of GET /notifications (same shape as socket `notification.created`). REVIEW → `referenceId` = review id. */
export type TNotification = TApiSchema<'NotificationResponse'>;
export type TNotificationType = TNotification['type'];
export type TNotificationsPage = TApiSchema<'ListMyNotificationsResponse'>;

/** Infinite-query cache of GET /notifications (same shape as react-query `InfiniteData`). */
export type TNotificationsCache = { pages: TNotificationsPage[]; pageParams: unknown[] };

/** All loaded pages merged — the list and the header badge read this one result. */
export type TNotificationsView = {
  items: TNotification[];
  /** Counted over the LOADED pages (the API has no unread total). */
  unreadCount: number;
  /** More pages exist and every loaded item is unread → the real count may be higher ("20+"). */
  unreadCountIsLowerBound: boolean;
};
